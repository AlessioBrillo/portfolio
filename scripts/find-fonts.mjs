#!/usr/bin/env node
/**
 * Search for Archivo font in Google Fonts repos
 */

async function searchArchivo() {
  try {
    const res = await fetch(
      'https://api.github.com/search/repositories?q=archivo+in:name+org:googlefonts',
    );
    const data = await res.json();
    console.log('Total:', data.total_count);
    for (const item of data.items) {
      console.log('Repo:', item.full_name);
      // Check contents
      try {
        const contentsRes = await fetch(`https://api.github.com/repos/${item.full_name}/contents/`);
        const contents = await contentsRes.json();
        if (Array.isArray(contents)) {
          for (const f of contents) {
            console.log('  ', f.name, f.type);
          }
        }
      } catch (e) {
        console.log('  Error getting contents');
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

searchArchivo();
