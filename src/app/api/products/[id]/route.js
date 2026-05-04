import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { authenticateAdmin } from '@/lib/auth';
import { deleteImage, uploadImage } from '@/lib/cloudinary';

// GET /api/products/[id]
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id).populate('categoryId', 'name slug').lean();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/products/[id] - Admin
export async function PATCH(request, { params }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const formData = await request.formData();
    const updates = {};

    const title = formData.get('title');
    const description = formData.get('description');
    const categoryId = formData.get('categoryId');
    const price = formData.get('price');
    const featured = formData.get('featured');
    const websiteUrl = formData.get('websiteUrl');

    // Always set these fields if they're present in the form data
    if (title !== null && title !== undefined) updates.title = title;
    if (description !== null && description !== undefined) updates.description = description || '';
    if (price !== null && price !== undefined) updates.price = price || '';
    if (featured !== null && featured !== undefined) updates.featured = featured === 'true';
    if (websiteUrl !== null && websiteUrl !== undefined) updates.websiteUrl = websiteUrl || '';
    
    // categoryId: set to the value or unset it
    if (categoryId !== null && categoryId !== undefined) {
      updates.categoryId = categoryId || null;
    }

    console.log('PATCH product updates:', JSON.stringify(updates));

    // Handle new images
    const newImages = formData.getAll('newImages');
    if (newImages && newImages.length > 0 && newImages[0].size > 0) {
      const product = await Product.findById(id);
      const uploadedImages = [...(product?.images || [])];

      for (const file of newImages) {
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const result = await uploadImage(buffer, 'fusion-gear/products');
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            thumbnailUrl: result.eager?.[0]?.secure_url || result.secure_url,
          });
        }
      }
      updates.images = uploadedImages;
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true }).populate('categoryId', 'name slug');
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Admin
export async function DELETE(request, { params }) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete all images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        try { await deleteImage(image.publicId); } catch (e) { /* continue */ }
      }
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
