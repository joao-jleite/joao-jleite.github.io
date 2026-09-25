/*
 * Demo registry. main.js renders every demo with enabled: true, in this order.
 * To turn a demo on or off, change `enabled` only: the layout adapts to one or two cards.
 * Media paths are relative to the site root (see tools/build_media.py).
 */
window.DEMOS = [
  {
    id: 'a',
    enabled: true,
    repo: 'https://github.com/joao-jleite/ai-document-extractor-demo',
    video: 'assets/media/demo-a.mp4',
    poster: 'assets/media/demo-a-poster.webp',
    gif: 'assets/media/demo-a.gif',
    size: [1280, 800],
    shots: [
      { base: 'assets/img/demo-a-validation', small: 800, full: 1600, w: 800, h: 500 },
      { base: 'assets/img/demo-a-order', small: 800, full: 1600, w: 800, h: 500 },
      { base: 'assets/img/demo-a-xlsx', small: 800, full: 1600, w: 800, h: 500 }
    ],
    text: {
      en: {
        title: 'AI Document Extractor',
        problem: 'Invoices and purchase orders arrive as PDFs or phone photos, and someone retypes them into a spreadsheet or the ERP.',
        solution: 'Upload a Brazilian NF-e (DANFE) or a purchase order as a PDF or photo. The Claude API extracts the fields into a fixed schema, and validation rules check totals, tax ID check digits, dates and currency. You get a table plus XLSX, PDF and JSON files.',
        stack: ['Python', 'FastAPI', 'Claude API', 'Pydantic', 'openpyxl', 'ReportLab'],
        note: 'Fictitious sample documents.',
        videoLabel: 'Screen recording of the demo: a document is uploaded, the fields are extracted and checked, and the Excel and PDF files are opened.',
        shots: [
          { alt: 'Validation of a phone photo of a DANFE: two warnings point out a line total that does not match quantity times unit price.', cap: 'Photo of a DANFE: the checks flag a line total that doesn’t add up' },
          { alt: 'A purchase order in Spanish, in US dollars, with supplier, buyer, grand total and all 8 checks passed.', cap: 'Purchase order in Spanish (USD): all 8 checks passed' },
          { alt: 'Excel file generated from the photo, with the line items and the mismatched line highlighted.', cap: 'Excel file generated from the photo, mismatch highlighted' }
        ]
      },
      es: {
        title: 'Extractor de documentos con IA',
        problem: 'Las facturas y órdenes de compra llegan en PDF o como fotos, y alguien tiene que transcribirlas a mano a una hoja de cálculo o al ERP.',
        solution: 'Se sube una NF-e brasileña (DANFE) o una orden de compra en PDF o foto. La API de Claude extrae los campos a un esquema fijo, y reglas de validación revisan totales, dígitos verificadores de identificación fiscal, fechas y moneda. El resultado es una tabla y archivos XLSX, PDF y JSON.',
        stack: ['Python', 'FastAPI', 'API de Claude', 'Pydantic', 'openpyxl', 'ReportLab'],
        note: 'Documentos de ejemplo ficticios.',
        videoLabel: 'Grabación de pantalla de la demo: se sube un documento, se extraen y revisan los campos, y se abren los archivos Excel y PDF.',
        shots: [
          { alt: 'Validación de una foto de una DANFE: dos avisos señalan un total de línea que no coincide con cantidad por precio unitario.', cap: 'Foto de una DANFE: los controles señalan un total de línea que no cuadra' },
          { alt: 'Una orden de compra en español, en dólares, con proveedor, comprador, total general y los 8 controles aprobados.', cap: 'Orden de compra en español (USD): los 8 controles aprobados' },
          { alt: 'Archivo Excel generado a partir de la foto, con las líneas de la factura y la línea que no cuadra resaltada.', cap: 'Excel generado a partir de la foto, con la diferencia resaltada' }
        ]
      }
    }
  },
  {
    id: 'b',
    enabled: true,
    repo: 'https://github.com/joao-jleite/playwright-scraper-demo',
    video: 'assets/media/demo-b.mp4',
    poster: 'assets/media/demo-b-poster.webp',
    gif: 'assets/media/demo-b.gif',
    size: [1280, 800],
    shots: [
      { base: 'assets/img/demo-b-crawl', small: 640, full: 1280, w: 640, h: 400 },
      { base: 'assets/img/demo-b-report', small: 800, full: 1600, w: 800, h: 500 },
      { base: 'assets/img/demo-b-xlsx', small: 800, full: 1600, w: 800, h: 500 }
    ],
    text: {
      en: {
        title: 'Playwright Scraper',
        problem: 'The data you need is spread across dozens of web pages, and copying it by hand is slow and error-prone.',
        solution: 'A Playwright crawler for books.toscrape.com, a public website made for scraping practice. It checks robots.txt first, collects the catalog and exports CSV and XLSX files, plus a PDF report with charts.',
        stack: ['Python', 'Playwright', 'Pydantic', 'openpyxl', 'ReportLab', 'Matplotlib'],
        note: 'Public practice website; no real business data.',
        videoLabel: 'Screen recording of the demo: a browser crawls the practice catalog, then the PDF report and the Excel file are opened.',
        shots: [
          { alt: 'A browser controlled by the scraper on a category page of the practice site, with each collected book outlined and a progress panel.', cap: 'Visible crawl of a category page, with a progress panel' },
          { alt: 'Page of the generated PDF report with a bar chart of average price by category.', cap: 'PDF report with charts, generated from the collected data' },
          { alt: 'Summary sheet of the generated Excel file: titles, prices, ratings and stock by category.', cap: 'Excel summary by category, generated by the scraper' }
        ]
      },
      es: {
        title: 'Scraper con Playwright',
        problem: 'Los datos que necesita están repartidos en decenas de páginas web, y copiarlos a mano es lento y propenso a errores.',
        solution: 'Un crawler con Playwright para books.toscrape.com, un sitio público creado para practicar scraping. Primero revisa el robots.txt, recorre el catálogo y exporta archivos CSV y XLSX, más un informe en PDF con gráficos.',
        stack: ['Python', 'Playwright', 'Pydantic', 'openpyxl', 'ReportLab', 'Matplotlib'],
        note: 'Sitio público de práctica; sin datos reales de empresas.',
        videoLabel: 'Grabación de pantalla de la demo: un navegador recorre el catálogo de práctica y después se abren el informe PDF y el archivo Excel.',
        shots: [
          { alt: 'Un navegador controlado por el scraper en una página de categoría del sitio de práctica, con cada libro recogido marcado y un panel de progreso.', cap: 'Recorrido visible de una categoría, con un panel de progreso' },
          { alt: 'Página del informe PDF generado con un gráfico de barras del precio medio por categoría.', cap: 'Informe PDF con gráficos, generado con los datos recogidos' },
          { alt: 'Hoja de resumen del archivo Excel generado: títulos, precios, valoraciones y stock por categoría.', cap: 'Resumen en Excel por categoría, generado por el scraper' }
        ]
      }
    }
  }
];
