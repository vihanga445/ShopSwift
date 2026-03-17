import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices' },
      { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement' },
      { name: 'Sports', slug: 'sports', description: 'Sports and fitness' },
      { name: 'Books', slug: 'books', description: 'Books and media' },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  await prisma.product.createMany({
    data: [
      { name: 'Wireless Headphones', description: 'Premium noise-canceling headphones with 30hr battery', price: 89.99, stock: 50, categoryId: catMap['electronics'], isFeatured: true, imageUrl: 'https://via.placeholder.com/400?text=Headphones' },
      { name: 'Mechanical Keyboard', description: 'RGB backlit TKL with blue switches', price: 129.99, stock: 30, categoryId: catMap['electronics'], isFeatured: true, imageUrl: 'https://via.placeholder.com/400?text=Keyboard' },
      { name: 'USB-C Hub', description: '7-in-1 hub with 4K HDMI and 100W PD', price: 39.99, stock: 100, categoryId: catMap['electronics'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=USB+Hub' },
      { name: 'Webcam 1080p', description: 'Full HD webcam with auto-focus', price: 59.99, stock: 45, categoryId: catMap['electronics'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=Webcam' },
      { name: 'Classic White Tee', description: '100% organic cotton heavyweight t-shirt', price: 24.99, stock: 200, categoryId: catMap['clothing'], isFeatured: true, imageUrl: 'https://via.placeholder.com/400?text=White+Tee' },
      { name: 'Slim Fit Chinos', description: 'Stretch cotton chino pants', price: 49.99, stock: 80, categoryId: catMap['clothing'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=Chinos' },
      { name: 'Running Jacket', description: 'Lightweight waterproof jacket', price: 79.99, stock: 60, categoryId: catMap['clothing'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=Jacket' },
      { name: 'Wool Beanie', description: 'Merino wool beanie, one size fits all', price: 19.99, stock: 150, categoryId: catMap['clothing'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=Beanie' },
      { name: 'Cast Iron Skillet', description: 'Pre-seasoned 12-inch cast iron skillet', price: 44.99, stock: 40, categoryId: catMap['home-garden'], isFeatured: true, imageUrl: 'https://via.placeholder.com/400?text=Skillet' },
      { name: 'Bamboo Cutting Board', description: 'Eco-friendly board with juice grooves', price: 29.99, stock: 90, categoryId: catMap['home-garden'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=CuttingBoard' },
      { name: 'LED Desk Lamp', description: 'Adjustable LED lamp with USB charging port', price: 34.99, stock: 70, categoryId: catMap['home-garden'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=DeskLamp' },
      { name: 'Ceramic Plant Pot Set', description: 'Minimalist pot set of 3 sizes', price: 21.99, stock: 120, categoryId: catMap['home-garden'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=PlantPot' },
      { name: 'Foam Yoga Mat', description: '6mm non-slip mat with carrying strap', price: 35.99, stock: 85, categoryId: catMap['sports'], isFeatured: true, imageUrl: 'https://via.placeholder.com/400?text=YogaMat' },
      { name: 'Resistance Bands Set', description: 'Set of 5 latex bands 10-50 lbs', price: 18.99, stock: 200, categoryId: catMap['sports'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=Bands' },
      { name: 'Insulated Water Bottle', description: '32oz double-wall vacuum insulated bottle', price: 27.99, stock: 150, categoryId: catMap['sports'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=WaterBottle' },
      { name: 'Speed Jump Rope', description: 'Ball bearing jump rope with adjustable cable', price: 14.99, stock: 300, categoryId: catMap['sports'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=JumpRope' },
      { name: 'Clean Code', description: 'Robert C. Martin-Agile Software Craftsmanship', price: 36.99, stock: 25, categoryId: catMap['books'], isFeatured: true, imageUrl: 'https://via.placeholder.com/400?text=CleanCode' },
      { name: 'The Pragmatic Programmer', description: 'David Thomas and Andrew Hunt-20th Anniversary', price: 42.99, stock: 20, categoryId: catMap['books'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=PragProg' },
      { name: 'Designing Data-Intensive Apps', description: 'Martin Kleppmann Reliable scalable systems', price: 54.99, stock: 15, categoryId: catMap['books'], isFeatured: true, imageUrl: 'https://via.placeholder.com/400?text=DDIA' },
      { name: 'JavaScript: The Good Parts', description: 'Douglas Crockford-JS programming guide', price: 24.99, stock: 30, categoryId: catMap['books'], isFeatured: false, imageUrl: 'https://via.placeholder.com/400?text=JSGoodParts' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete: 5 categories, 20 products');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());