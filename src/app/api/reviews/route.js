import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { authenticateAdmin } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { storeReviewPhoto, UploadError, MAX_PHOTOS } from '@/lib/images';
import { getReviews, parseReviewQuery } from '@/lib/reviews';
import { cleanText, escapeRegex, intInRange, isCategory } from '@/lib/validate';

export const maxDuration = 30;

// GET /api/reviews
//   Public: approved reviews only (same data and filters as the /reviews page).
//   Admin (?status=pending|approved|rejected|all): moderation list incl. private fields.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    if (!status) {
      const data = await getReviews(parseReviewQuery(Object.fromEntries(searchParams)));
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' },
      });
    }

    const admin = await authenticateAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const page = intInRange(searchParams.get('page'), 1, 10000) || 1;
    const limit = intInRange(searchParams.get('limit'), 1, 100) || 24;
    const search = cleanText(searchParams.get('search'), 80);

    const query = {};
    if (['pending', 'approved', 'rejected'].includes(status)) query.status = status;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ name: rx }, { text: rx }, { product: rx }, { orderId: rx }];
    }

    await dbConnect();
    const [reviews, total] = await Promise.all([
      Review.find(query).select('+orderId +contact').sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(limit).lean(),
      Review.countDocuments(query),
    ]);

    return NextResponse.json(
      { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: page * limit < total } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Get reviews error:', error.message);
    return NextResponse.json({ error: 'Could not load reviews' }, { status: 500 });
  }
}

// POST /api/reviews - public review submission. Always lands in the moderation queue.
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!(await rateLimit(`submit:${ip}`, 3, 24 * 60 * 60 * 1000))) {
      return NextResponse.json(
        { error: 'You have sent a few reviews already today. Try again tomorrow.' },
        { status: 429 }
      );
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Upload too large. Use smaller photos.' }, { status: 413 });
    }

    // Honeypot: real people never see or fill this field. Pretend success for bots.
    if (cleanText(form.get('company'), 100)) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (!(await verifyTurnstile(form.get('cf-turnstile-response'), ip))) {
      return NextResponse.json({ error: 'Spam check failed. Refresh the page and try again.' }, { status: 400 });
    }

    const errors = {};
    const name = cleanText(form.get('name'), 60);
    const text = cleanText(form.get('text'), 1000);
    const rating = intInRange(form.get('rating'), 1, 5);
    const product = cleanText(form.get('product'), 120);
    const category = cleanText(form.get('category'), 40);
    const orderId = cleanText(form.get('orderId'), 40);
    const contact = cleanText(form.get('contact'), 120);
    const files = form.getAll('photos').filter((f) => typeof f === 'object' && f.size > 0);

    if (name.length < 2) errors.name = 'Add your name';
    if (!rating) errors.rating = 'Pick a star rating';
    if (text.length < 10) errors.text = 'Write at least a sentence (10+ characters)';
    if (category && !isCategory(category)) errors.category = 'Pick a category from the list';
    if (files.length > MAX_PHOTOS) errors.photos = `Up to ${MAX_PHOTOS} photos`;
    if (orderId && !contact) errors.contact = 'Add the phone or email used for the order';

    if (Object.keys(errors).length) {
      return NextResponse.json({ error: 'Check the highlighted fields', fields: errors }, { status: 400 });
    }

    let photos = [];
    try {
      photos = await Promise.all(files.map((f) => storeReviewPhoto(f)));
    } catch (e) {
      if (e instanceof UploadError) return NextResponse.json({ error: e.message, fields: { photos: e.message } }, { status: 400 });
      throw e;
    }

    await dbConnect();
    await Review.create({
      name, text, rating,
      product: product || undefined,
      category: category || undefined,
      orderId: orderId || undefined,
      contact: contact || undefined,
      photos: photos.length ? photos : undefined,
      status: 'pending',
      source: 'customer',
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error.message);
    return NextResponse.json({ error: 'Something went wrong on our side. Try again in a minute.' }, { status: 500 });
  }
}

