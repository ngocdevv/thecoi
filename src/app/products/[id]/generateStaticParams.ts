import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
  try {
    // Read the data.json file
    const dataPath = path.join(process.cwd(), 'data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Get all product IDs
    const productIds = jsonData.categories
      .flatMap((category: any) => category.items)
      .map((item: any) => ({
        id: item.restaurant_item_id.toString(),
      }));

    return productIds;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
} 