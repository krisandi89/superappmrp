{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red109\green115\blue120;\red23\green24\blue24;\red202\green202\blue202;
\red183\green111\blue247;\red212\green212\blue212;\red113\green192\blue131;\red246\green124\blue48;}
{\*\expandedcolortbl;;\cssrgb\c50196\c52549\c54510;\cssrgb\c11765\c12157\c12549;\cssrgb\c83137\c83137\c83137;
\cssrgb\c77255\c54118\c97647;\cssrgb\c86275\c86275\c86275;\cssrgb\c50588\c78824\c58431;\cssrgb\c98039\c56471\c24314;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 // Import library Vercel KV untuk berinteraksi dengan database\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \strokec4  kv \cf6 \strokec6 \}\cf4 \strokec4  \cf5 \strokec5 from\cf4 \strokec4  \cf7 \strokec7 '@vercel/kv'\cf6 \strokec6 ;\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 // Export fungsi utama yang akan dijalankan oleh Vercel\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf4 \strokec4  \cf5 \strokec5 default\cf4 \strokec4  \cf5 \strokec5 async\cf4 \strokec4  \cf5 \strokec5 function\cf4 \strokec4  handler\cf6 \strokec6 (\cf4 \strokec4 request\cf6 \strokec6 ,\cf4 \strokec4  response\cf6 \strokec6 )\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec4   \cf2 \strokec2 // Hanya izinkan metode GET untuk mengambil data\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4   \cf5 \strokec5 if\cf4 \strokec4  \cf6 \strokec6 (\cf4 \strokec4 request\cf6 \strokec6 .\cf4 \strokec4 method \cf6 \strokec6 !==\cf4 \strokec4  \cf7 \strokec7 'GET'\cf6 \strokec6 )\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf5 \strokec5 return\cf4 \strokec4  response\cf6 \strokec6 .\cf4 \strokec4 status\cf6 \strokec6 (\cf8 \strokec8 405\cf6 \strokec6 ).\cf4 \strokec4 json\cf6 \strokec6 (\{\cf4 \strokec4  message\cf6 \strokec6 :\cf4 \strokec4  \cf7 \strokec7 'Metode tidak diizinkan'\cf4 \strokec4  \cf6 \strokec6 \});\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4   \cf6 \strokec6 \}\cf4 \cb1 \strokec4 \
\
\cf4 \cb3 \strokec4   \cf5 \strokec5 try\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf2 \strokec2 // Ambil ppuNumber dari query URL (contoh: /api/ambilPPU?ppuNumber=PPU-123)\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf5 \strokec5 const\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \strokec4  ppuNumber \cf6 \strokec6 \}\cf4 \strokec4  \cf6 \strokec6 =\cf4 \strokec4  request\cf6 \strokec6 .\cf4 \strokec4 query\cf6 \strokec6 ;\cf4 \cb1 \strokec4 \
\
\cf4 \cb3 \strokec4     \cf5 \strokec5 if\cf4 \strokec4  \cf6 \strokec6 (!\cf4 \strokec4 ppuNumber\cf6 \strokec6 )\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4       \cf5 \strokec5 return\cf4 \strokec4  response\cf6 \strokec6 .\cf4 \strokec4 status\cf6 \strokec6 (\cf8 \strokec8 400\cf6 \strokec6 ).\cf4 \strokec4 json\cf6 \strokec6 (\{\cf4 \strokec4  success\cf6 \strokec6 :\cf4 \strokec4  \cf5 \strokec5 false\cf6 \strokec6 ,\cf4 \strokec4  message\cf6 \strokec6 :\cf4 \strokec4  \cf7 \strokec7 'Nomor PPU diperlukan.'\cf4 \strokec4  \cf6 \strokec6 \});\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf6 \strokec6 \}\cf4 \cb1 \strokec4 \
\
\cf4 \cb3 \strokec4     \cf2 \strokec2 // Ambil data dari Vercel KV berdasarkan ppuNumber\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf5 \strokec5 const\cf4 \strokec4  data \cf6 \strokec6 =\cf4 \strokec4  \cf5 \strokec5 await\cf4 \strokec4  kv\cf6 \strokec6 .\cf5 \strokec5 get\cf6 \strokec6 (\cf4 \strokec4 ppuNumber\cf6 \strokec6 );\cf4 \cb1 \strokec4 \
\
\cf4 \cb3 \strokec4     \cf2 \strokec2 // Jika data tidak ditemukan, kirim pesan error\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf5 \strokec5 if\cf4 \strokec4  \cf6 \strokec6 (!\cf4 \strokec4 data\cf6 \strokec6 )\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4       \cf5 \strokec5 return\cf4 \strokec4  response\cf6 \strokec6 .\cf4 \strokec4 status\cf6 \strokec6 (\cf8 \strokec8 404\cf6 \strokec6 ).\cf4 \strokec4 json\cf6 \strokec6 (\{\cf4 \strokec4  success\cf6 \strokec6 :\cf4 \strokec4  \cf5 \strokec5 false\cf6 \strokec6 ,\cf4 \strokec4  message\cf6 \strokec6 :\cf4 \strokec4  \cf7 \strokec7 'Data PPU tidak ditemukan.'\cf4 \strokec4  \cf6 \strokec6 \});\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf6 \strokec6 \}\cf4 \cb1 \strokec4 \
\
\cf4 \cb3 \strokec4     \cf2 \strokec2 // Jika data ditemukan, kirim datanya\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf5 \strokec5 return\cf4 \strokec4  response\cf6 \strokec6 .\cf4 \strokec4 status\cf6 \strokec6 (\cf8 \strokec8 200\cf6 \strokec6 ).\cf4 \strokec4 json\cf6 \strokec6 (\{\cf4 \strokec4  success\cf6 \strokec6 :\cf4 \strokec4  \cf5 \strokec5 true\cf6 \strokec6 ,\cf4 \strokec4  data\cf6 \strokec6 :\cf4 \strokec4  data \cf6 \strokec6 \});\cf4 \cb1 \strokec4 \
\
\cf4 \cb3 \strokec4   \cf6 \strokec6 \}\cf4 \strokec4  \cf5 \strokec5 catch\cf4 \strokec4  \cf6 \strokec6 (\cf4 \strokec4 error\cf6 \strokec6 )\cf4 \strokec4  \cf6 \strokec6 \{\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     console\cf6 \strokec6 .\cf4 \strokec4 error\cf6 \strokec6 (\cf7 \strokec7 'Error saat mengambil PPU:'\cf6 \strokec6 ,\cf4 \strokec4  error\cf6 \strokec6 );\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4     \cf5 \strokec5 return\cf4 \strokec4  response\cf6 \strokec6 .\cf4 \strokec4 status\cf6 \strokec6 (\cf8 \strokec8 500\cf6 \strokec6 ).\cf4 \strokec4 json\cf6 \strokec6 (\{\cf4 \strokec4  success\cf6 \strokec6 :\cf4 \strokec4  \cf5 \strokec5 false\cf6 \strokec6 ,\cf4 \strokec4  message\cf6 \strokec6 :\cf4 \strokec4  \cf7 \strokec7 'Terjadi kesalahan pada server.'\cf4 \strokec4  \cf6 \strokec6 \});\cf4 \cb1 \strokec4 \
\cf4 \cb3 \strokec4   \cf6 \strokec6 \}\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 \}\cf4 \cb1 \strokec4 \
\
}