import { NextResponse } from 'next/server';
import { db } from '../../../lib/googleSheets';

// Helper to map Sheet columns to Frontend keys
const mapRowToFrontend = (row) => ({
  s_no: row.s_no,
  brand_name: row.brand_name,
  brand_logo: row.brand_logo,
  slug: row.slug,
  Founder_name: row.Founder_name,
  Founder_image: row.Founder_image,
  OLD_MRR: row.OLD_MRR,
  timeline: row.timeline,
  New_MRR: row.New_MRR,
  Cover_Image_link: row.Cover_Image_link,
  
  // Mapping based on your screenshot
  Cover_text: row.Cover_text_1 || row.Cover_text, 
  body_text: row.body_text_1 || row.body_text,
  
  Custom_CTA: row.Custom_CTA,
  SEO_meta_data: row.SEO_meta_data,
  Category_tags: row.Category_tags,
  tag: row.tag,
  rowIndex: row.rowIndex,
});

// Helper to map Frontend keys back to Sheet columns
const mapFrontendToRow = (data) => ({
  ...data,
  Cover_text_1: data.Cover_text,
  body_text_1: data.body_text
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    // 1. Fetch the list of ALL sheets dynamically
    const allSheets = await db.getSheets();

    // 2. Determine which sheet to load (default to the first one found)
    const sheetTitle = searchParams.get('sheet') || allSheets[0];

    // 3. Get data for that specific sheet
    const rawData = await db.getAll(sheetTitle);

    // 4. Clean and map the data
    const cleanData = rawData
      .filter(row => row.brand_name && row.brand_name.trim() !== "")
      .map(mapRowToFrontend);

    // 5. Return both the data AND the list of sheets for the dropdown
    return NextResponse.json({ 
      sheet: sheetTitle,
      sheets: allSheets, // Frontend uses this to build the <select> options
      data: cleanData 
    });

  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sheetName, data, action } = await req.json();
    const targetSheet = sheetName || 'Sheet1';
    const mappedData = mapFrontendToRow(data);

    if (action === 'CREATE') {
      await db.add(mappedData, targetSheet);
    } 
    else if (action === 'UPDATE') {
      await db.update(data.s_no, mappedData, targetSheet);
    } 
    else if (action === 'DELETE') {
      await db.delete(data.s_no, targetSheet);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}