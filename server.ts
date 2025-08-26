
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { PythonShell } from 'python-shell';
import * as http from 'http';
import * as https from 'https';
import { readdir } from 'fs/promises'
import * as  fs from 'fs'
import { interval } from 'rxjs';
import { APIConfig, PORT, folderPaths, rootPath } from './SETTINGS.service';
import { Server } from 'socket.io';//(http);
import multer from "multer";
import path from 'path';
import * as cheerio from "cheerio";
import cors from "cors";
import puppeteer from 'puppeteer';
// import zlib from 'zlib'
import * as zlib from 'zlib';  // make sure you have this import at the top
import { config } from './src/config';
import axios from 'axios';
// import { stockPriceAnalysisController } from './stockroute';
// import { JSDOM } from "jsdom";
// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  // server.use(cors()); // Allow requests from frontend

  // Configure CORS for your specific origin
  server.use(cors({
    origin: 'https://localhost:1010', // Your Angular app's origin
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: false // Set to true if you need cookies/auth

  }));
  server.use(express.json());
  // ✅ Correctly define `__dirname` for ES Modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // ✅ Define the correct path for `data.json`
  // const DATA_FILE = join(__dirname, "data.json");
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);
  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  let dirName = '/root/loadURL/SiteAnalyzer'

  server.post('/save-data', (req, res) => {
    const obj = req.body;

    if (!obj.companyName || !obj.data) {
      res.status(400).json({ error: 'Missing required fields: companyName and data' });
    }
    // Use companyName as filename
    const filename = `${obj.companyName}.json`;
    const outputDir = path.join(dirName, 'saved');
    // console.log('dirName', dirName)
    const outPath = path.join(outputDir, filename);
    // console.log('outPath', outPath)
    // Ensure the directory exists
    fs.mkdir(outputDir, { recursive: true }, (err: any) => {
      if (err) {
        console.error('❌ Directory creation error:', err);
        res.status(500).json({ error: 'Failed to create directory' });
      }

      // Overwrite file (or create new)
      fs.writeFile(outPath, JSON.stringify(obj, null, 2), (err) => {
        if (err) {
          console.error('❌ File write error:', err);
          res.status(500).json({ error: 'Failed to save file' });
        }

        res.json({ message: `Saved successfully as ${filename}` });
      });
    });
  });









  // Rajat Ranjan 01-08-2025

  const MAX_REDIRECTS = 5;

  function fetchAndProxy(url: string, res: express.Response, redirectCount = 0) {
    const parsedUrl = new URL(url);

    const options: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      port: parsedUrl.port || 443,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Host': 'www.sec.gov',
        'Referer': 'https://www.sec.gov/',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-User': '?1'
      },
      timeout: 10000,
    };

    const request = https.get(options, (response) => {
      // Handle redirects
      if ([301, 302, 307, 308].includes(response.statusCode!) && response.headers.location) {
        if (redirectCount >= MAX_REDIRECTS) {
          return res.status(508).json({ error: 'Too many redirects' });
        }
        const redirectUrl = new URL(response.headers.location, parsedUrl).toString();
        return fetchAndProxy(redirectUrl, res, redirectCount + 1);
      }

      // Handle errors (non-200)
      if (response.statusCode !== 200) {
        const chunks: Buffer[] = [];
        response.on('data', chunk => chunks.push(chunk));
        console.log(`Requested: ${url}`);
        console.log(`Received status: ${response.statusCode}`);

        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          res.status(response.statusCode!).send(body || 'Error');
        });
        return;
      }

      // Handle compressed responses
      let stream: NodeJS.ReadableStream = response;
      const encoding = response.headers['content-encoding'];
      if (encoding === 'gzip') stream = stream.pipe(zlib.createGunzip());
      else if (encoding === 'deflate') stream = stream.pipe(zlib.createInflate());
      else if (encoding === 'br') stream = stream.pipe(zlib.createBrotliDecompress());

      const data: Buffer[] = [];
      stream.on('data', chunk => data.push(chunk));
      stream.on('end', () => {
        const html = Buffer.concat(data).toString('utf8');
        const base = `${parsedUrl.protocol}//${parsedUrl.host}`;

        const fixed = html
          .replace(/(href|src)=["'](\/[^"']*)["']/gi, (_, a, u) => `${a}="${base}${u}"`)
          .replace(/url\(['"]?(\/[^)'"]+)['"]?\)/gi, (_, u) => `url(${base}${u})`);

        res.setHeader('Content-Type', 'text/html');
        res.send(fixed);
      });

      stream.on('error', (err) => {
        if (!res.headersSent) res.status(500).json({ error: err.message });
      });
    });

    request.on('timeout', () => {
      request.destroy();
      if (!res.headersSent) res.status(504).json({ error: 'Timeout' });
    });

    request.on('error', (err) => {
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });
  }

  server.post('/proxy1', (req, res) => {
    const { url } = req.body;
    if (!url) res.status(400).json({ error: "Missing 'url' parameter" });

    try {
      fetchAndProxy(url, res);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  server.post('/proxyorg', (req, res) => {
    const { url } = req.body;
    if (!url) res.status(400).json({ error: "Missing 'url' parameter" });

    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      port: parsedUrl.port || 443,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.sec.gov/',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    };

    const request = https.get(options, (response) => {
      if ([301, 302, 307].includes(response.statusCode!)) {
        const redirectUrl = response.headers.location!;
        res.status(307).json({ redirect: redirectUrl });
      }
      if (response.statusCode !== 200) {
        res.status(response.statusCode!).send('Error');
      }

      let stream: NodeJS.ReadableStream = response;
      const enc = response.headers['content-encoding'];
      if (enc === 'gzip') stream = response.pipe(zlib.createGunzip());
      else if (enc === 'deflate') stream = response.pipe(zlib.createInflate());
      else if (enc === 'br') stream = response.pipe(zlib.createBrotliDecompress());

      const data: Buffer[] = [];
      stream.on('data', chunk => data.push(chunk));
      stream.on('end', () => {
        const html = Buffer.concat(data).toString('utf8');
        // rewrite URLs
        const base = `${parsedUrl.protocol}//${parsedUrl.host}`;
        const fixed = html
          .replace(/(href|src)=["'](\/[^"']*)["']/gi, (_, a, u) => `${a}="${base}${u}"`)
          .replace(/url\(['"]?(\/[^)'"]+)['"]?\)/gi, (_, u) => `url(${base}${u})`);
        res.setHeader('Content-Type', 'text/html');
        res.send(fixed);
      });

      stream.on('error', err => {
        if (!res.headersSent) res.status(500).json({ error: err.message });
      });
    });

    request.on('timeout', () => {
      request.destroy();
      if (!res.headersSent) res.status(504).json({ error: 'Timeout' });
    });
    request.on('error', err => {
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });
  });



  server.post('/proxy2', (req, res) => {
    //console.log("📥 Request Body:", req.body);
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: "Missing 'url' parameter" });
      return;
    }

    try {
      const parsedUrl = new URL(url);
      //console.log(`🌍 Fetching website: ${parsedUrl.href}`);

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        port: parsedUrl.port || 443,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'text/html',
          'Accept-Encoding': 'gzip, deflate',
        },
        timeout: 10000
      };

      const request = https.get(options, (response) => {
        //console.log(`🔄 Response Status: ${response.statusCode}`);

        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          //console.log(`➡️ Redirecting to: ${redirectUrl}`);
          res.status(307).json({ redirect: redirectUrl });
          return;
        }

        if (response.statusCode !== 200) {
          //console.log(`❗ Unexpected status code: ${response.statusCode}`);
          res.status(response.statusCode ?? 500).send('Error');
          return;
        }

        const encoding = response.headers['content-encoding'];
        let stream: NodeJS.ReadableStream = response;

        if (encoding === 'gzip') {
          //console.log("📦 Decompressing gzip...");
          stream = response.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          //console.log("📦 Decompressing deflate...");
          stream = response.pipe(zlib.createInflate());
        } else {
          //console.log("ℹ️ No compression detected.");
        }

        const data: any[] = [];
        stream.on('data', (chunk) => data.push(chunk));

        stream.on('end', () => {
          let html = Buffer.concat(data).toString('utf8');

          const baseOrigin = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}`;

          function resolveUrl(url: string, base: URL): string {
            try {
              return new URL(url, base).href;
            } catch {
              return url;
            }
          }

          // Rewrite all href/src attributes (handles both root-relative and relative paths)
          html = html.replace(/(href|src)=["']([^"']+)["']/gi, (match, attr, url) => {
            if (/^https?:\/\//i.test(url)) return match;
            const absoluteUrl = resolveUrl(url, parsedUrl);
            return `${attr}="${absoluteUrl}"`;
          });

          // Rewrite CSS url(...) as well
          html = html.replace(/url\(['"]?([^)'"]+)['"]?\)/gi, (match, urlPath) => {
            if (/^https?:\/\//i.test(urlPath)) return match;
            const absoluteUrl = resolveUrl(urlPath, parsedUrl);
            return `url(${absoluteUrl})`;
          });

          //console.log("✅ Fetched and fixed HTML");

          if (!res.headersSent) {
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
          }
        });


        stream.on('error', (err) => {
          console.error("❌ Stream error:", err.message);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Decompression failed', details: err.message });
          }
        });
      });

      request.on('timeout', () => {
        request.destroy();
        if (!res.headersSent) {
          res.status(504).json({ error: 'Request timed out' });
        }
      });

      request.on('error', (err) => {
        console.error("❌ HTTPS error:", err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Fetch failed', details: err.message });
        }
      });

    } catch (error: any) {
      console.error("❌ URL parsing failed:", error.message);
      if (!res.headersSent) {
        res.status(400).json({ error: 'Invalid URL format', details: error.message });
      }
    }
  });



  function makeUrlsAbsolute(html: string, baseUrl: any) {
    // baseUrl example: https://www.sec.gov

    return html.replace(/(href|src)=["'](\/[^"']*)["']/g, (match, attr, urlPath) => {
      return `${attr}="${baseUrl}${urlPath}"`;
    });
  }



  //proxxy2
  const cache: Map<string, string> = new Map<string, string>();
  server.post('/proxy', (req, res) => {
    //console.log("📥 Request Body:", req.body);
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: "Missing 'url' parameter" });
    }

    if (cache.has(url)) {
      //console.log(`📦 Serving from cache: ${url}`);
      res.json({ html: cache.get(url) }); // Return cached HTML as JSON
    }

    try {
      const parsedUrl = new URL(url);
      //console.log(`🌍 Fetching website: ${parsedUrl.href}`);
      //console.log(`🌍 Fetching hostname: ${parsedUrl.hostname}`);
      //console.log(`🌍 Fetching pathname: ${parsedUrl.pathname + parsedUrl.search}`);
      //console.log(' parsedUrl.port || 443,', parsedUrl.port || 443,)
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        port: parsedUrl.port || 443,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Referer': parsedUrl.origin
        },
        timeout: 90000
      };

      const request = https.get(options, (response) => {
        //console.log(`Response Status: ${response.statusCode}`);
        //console.log(`Response Headers: ${JSON.stringify(response.headers)}`);

        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          //console.log(`Redirecting to: ${redirectUrl}`);
          res.status(307).json({ redirect: redirectUrl });
        }

        if (response.statusCode && response.statusCode !== 200) {
          //console.log(`Unexpected status code: ${response.statusCode}`);
          res.status(response.statusCode).json({ error: response.statusMessage || 'Unknown error' });
        }

        const encoding = response.headers['content-encoding'];
        let stream: any = response;

        if (encoding === 'gzip') {
          //console.log("Decompressing gzip...");
          stream = response.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          //console.log("Decompressing deflate...");
          stream = response.pipe(zlib.createInflate());
        } else {
          //console.log("No compression detected.");
        }

        let data: any = [];
        stream.on('data', (chunk: any) => {
          data.push(chunk);
        });

        stream.on('end', () => {
          const html = Buffer.concat(data).toString('utf8');
          //console.log("✅ Website fetched successfully. First 100 chars:", html.substring(0, 100));
          cache.set(url, html);
          res.json({ html }); // Return HTML as JSON
        });

        stream.on('error', (error: any) => {
          console.error("❌ Decompression error:", error.message);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to decompress response', details: error.message });
          }
        });
      });

      request.on('timeout', () => {
        request.destroy();
        if (!res.headersSent) {
          res.status(504).json({ error: 'Request timed out' });
        }
      });

      request.on('error', (error) => {
        console.error("❌ Error fetching website:", error.message);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to fetch website',
            details: error.message
          });
        }
      });
    } catch (error: any) {
      console.error("❌ Invalid URL:", error.message);
      if (!res.headersSent) {
        res.status(400).json({
          error: 'Invalid URL format',
          details: error.message
        });
      }
    }
  });

  server.get(rootPath + '/getInterval', (req, res) => {
    //console.log('getData is running')
    var q = req.query;
    //  w = req.query.Docs;
    //console.log('getData is get the vale q', '\n', q, '\n', q['compname'])
    // var opath = `/dataSroreAPI?projid=${q['projid']}&docid=${q['docid']}&pgno=${q['pgno']}&get=${q['get']}`
    // var opath = `/getpdfpage2_test?compname=${q['compname']}&docname=${q['docname']}&pgno=${q['pgno']}`
    //console.log('%cHello server.js line:196 socket', 'background: green; color: white; display: block;', req.query);

    // make connection with user from server side
    io.on('connection', (socket: any) => {
      //console.log('New user connected');

      // listen for message from user
      // socket.on('sendData', (clientData)=>{
      //   //console.log('clientData', clientData);

      //       socket.emit('clientData', j.message);
      //   });
      // send message to frontend

      interval(5000).subscribe(() => {
        //console.log('%cHello server.ts:59 interval', 'background: green; color: white; display: block;');
        // fetch(q['url'] as string).then((response) => response.json())
        // // Showing response
        // .then((json) =>{
        // //console.log('json', json, json[0].message, q['url'])
        // if(json[0].message=='done')
        // io.emit('getFiles', json[0].files_lst);
        io.emit('getFiles', true);

        // })
        // .catch(err => //console.log(err))



        // var options = {
        //   host: '172.16.20.241',//in setting setting.datastoreIP is not define
        //   port: 9099,
        //   path: `/compfiles?compname="${q['compname']}"`,
        //   method: 'GET'
        // }
        // var request = http.request(options, function (resp) {
        //   //console.log('%cserver.ts:75 resp', 'color: #007acc;', resp);
        //   io.emit('getFiles', 'a');
        //   res.send(['resp'])
        // });
        // request.on('error', function (e) {
        //   //console.log("eEE : ", e.message);
        // });
        // //console.log('%cHello server.ts:45 ', 'background: green; color: white; display: block;')
        // request.end();
      })
      // when server disconnects from user
      // socket.on('disconnect', ()=>{
      //   //console.log('disconnected from user');
      // });
    });
    res.send(true)
    // //console.log("OPRTTTLINK",opath)


  })
  server.get(rootPath + '/getDataNew', (req, res) => {
    //console.log('getData is running')
    var q = req.query;
    //  w = req.query.Docs;
    //console.log('getData is get the vale q', '\n', q, '\n')
    var opath = `/dataSroreAPI?projid=${q['projid']}&docid=${q['docid']}&pgno=${q['pgno']}&get=${q['get']}`
    // var opath = `/getpdfpage2_test?compname=${q['compname']}&docname=${q['docname']}&pgno=${q['pgno']}`

    //console.log("OPRTTTLINK", opath)
    var options = {
      host: '172.16.20.120',//in setting setting.datastoreIP is not define
      port: 9097,
      path: opath,
      method: 'GET'
    }
    var request = http.request(options, function (resp) {
      var data: any = [];
      resp.on('data', function (chunk) {
        data.push(chunk);
      });
      resp.on('end', function () {
        var binary = Buffer.concat(data);
        //console.log("binary", binary)
        res.send(binary)
        // //console.log("res",res)
      });
    });
    request.on('error', function (e) {
      //console.log("eEE : ", e.message);
    });

    request.end();

  })
  server.get(rootPath + '/getData', (req, res) => {
    //console.log('getData is running')
    var q = req.query;
    //  w = req.query.Docs;
    //console.log('getData is get the vale q', '\n', q, '\n')
    var opath = `/dataSroreAPI?projid=${q['projid']}&docid=${q['docid']}&pgno=${q['pgno']}&get=${q['get']}`
    //console.log("opat", opath)
    var options = {
      host: '172.16.20.120',//in setting setting.datastoreIP is not define
      port: 4521,
      path: opath,
      method: 'GET'
    }
    var request = http.request(options, function (resp) {
      var data = '';
      resp.on('data', function (chunk) {
        data += chunk;

      });
      resp.on('end', function () {
        res.send(data)
      });
    });
    request.on('error', function (e) {
      //console.log("eEE : ", e.message);
    });

    request.end();

  })

  //Rajat To get the folder path
  const baseURL = config.baseURL; // 'http://172.16.20.178/test_datasets/'
  // const baseURI ='http://localhost/WorkSpaceBuilder_DB/3/1/pdata/docs/9844/'
  server.post('/listfolder', (req, res) => {
    //console.log("📥 Request Body:", req.body);

    http.get(baseURL, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const $ = cheerio.load(data);
          const folderList: any = [];

          $("a").each((_, element) => {
            const folderName = $(element).attr("href");

            // ✅ Filter out unwanted entries
            if (
              folderName &&
              folderName.endsWith("/") &&
              folderName !== "/" &&
              !folderName.startsWith("?") && // Remove "?C=N;O=D" types
              folderName !== "../"  // Remove parent directory link
            ) {
              folderList.push(folderName.replace(/\/$/, "")); // 🔹 Remove trailing slash
            }
          });

          //console.log("📂 Folders Found:", folderList);
          res.json({ status: 'Done', data: folderList }); // Send JSON array

        } catch (error) {
          console.error("❌ Error processing response:", error);
          res.status(500).json({ error: "Failed to process response" });
        }
      });

    }).on('error', (error) => {
      console.error("❌ Error fetching folder list:", error);
      res.status(500).json({ error: "Failed to fetch folder list" });
    });
  });


  // Rajat ranjan Kumar
  // const baseURL = "http://172.16.20.178/test_datasets/HRA_AD/";
  server.post('/listpdfs', (req, res) => {
    //console.log("📥 Request Body:", req.body);
    const { cmp_name } = req.body; // Extract the folder name
    const folderURL = `${baseURL}${cmp_name}/`; // Construct the full folder URL

    //console.log(`🔎 Fetching contents from: ${folderURL}`);

    http.get(folderURL, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const $ = cheerio.load(data);
          const itemList: any = [];

          $("a").each((_, element) => {
            const itemName = $(element).attr("href");

            if (itemName) {
              // const isPDF = itemName.endsWith(".pdf");
              // const isDOCX = itemName.endsWith(".docx");
              const isParentDirectory = itemName === "../"; // Ignore parent directory link
              const isCurrentDirectory = itemName === "./"; // Ignore current directory
              const isSortingLink = itemName.startsWith("?C="); // Ignore sorting links
              const isBaseDir = itemName.includes("test_datasets"); // Remove base directory

              // ✅ Filter out unwanted entries
              if (!isParentDirectory && !isCurrentDirectory && !isSortingLink && !isBaseDir) {
                let cleanName = itemName.replace(/\/$/, ""); // Remove trailing slash if any
                let lowerCaseName = cleanName.toLowerCase(); // Convert to lowercase for comparison
                // itemList.push({
                //   n: cleanName,
                //   path: `${folderURL}${cleanName}`, // Corrected path
                //   type: isPDF ? "pdf" : isDOCX ? "docx" : "folder"
                // });

                // ✅ Detect the correct file type
                const fileType = itemName.endsWith("/") ? "folder" :
                  lowerCaseName.endsWith(".pdf") ? "pdf" :
                    itemName.endsWith(".csv") ? "csv" :
                      itemName.endsWith(".docx") ? "docx" :
                        itemName.endsWith(".xlsx") ? "xlsx" :
                          itemName.endsWith(".txt") ? "txt" :
                            "unknown"; // Default for other file types

                // ✅ Ensure correct path format (avoid double slashes)
                let fullPath = `${folderURL}${cleanName}`.replace(/([^:]\/)\/+/g, "$1"); // Fix double slashes

                itemList.push({
                  n: cleanName,
                  path: fullPath,
                  type: fileType
                });
              }
            }
          });

          //console.log("📂📄 Fetched Items:", itemList);
          res.json({ status: 'Done', data: itemList });

        } catch (error) {
          console.error("❌ Error processing response:", error);
          res.status(500).json({ error: "Failed to process response" });
        }
      });

    }).on('error', (error) => {
      console.error("❌ Error fetching directory contents:", error);
      res.status(500).json({ error: "Failed to fetch directory contents" });
    });
  });



  server.post('/listfolder_second', (req, res) => {
    //console.log("📥 Request Body:", req.body);
    const { cmp_name, folderPath } = req.body; // Extract folder path from request

    if (!folderPath) {
      res.status(400).json({ error: "Missing folderPath in request body" });
    }

    const fullPath = `${baseURL}${cmp_name}/${folderPath}/`; // Construct full URL

    //console.log(`🔎 Fetching contents from: ${fullPath}`);

    http.get(fullPath, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const $ = cheerio.load(data);
          const itemList: any = [];
          //console.log("folderPath", folderPath, "fullpath", fullPath)

          // 🔼 **Add Parent Directory Option** (Only if not in root)
          if (folderPath !== "") {
            // const parentPath = folderPath.split('/').slice(0, -1).join('/');
            itemList.push({
              n: "Parent Directory",
              path: `${fullPath}` || "",  // If root, path is empty
              type: "parent"
            });
          }

          $("a").each((_, element) => {
            let itemName = $(element).attr("href");

            if (itemName) {
              // 🚨 **Fix for Spaces & Special Characters**
              itemName = decodeURIComponent(itemName).trim();

              // const isPDF = itemName.toLowerCase().endsWith(".pdf");
              // const isDOCX = itemName.toLowerCase().endsWith(".docx");
              const isParentDirectory = itemName === "../"; // Ignore actual parent directory link
              const isCurrentDirectory = itemName === "./"; // Ignore current directory
              const isSortingLink = itemName.startsWith("?C="); // Ignore sorting links
              const isBaseDir = itemName.includes("test_datasets"); // Remove base directory
              // ✅ **Filter out unwanted items**
              if (!isCurrentDirectory && !isSortingLink && !isBaseDir) {
                let cleanName = itemName.replace(/\/$/, ""); // Remove trailing slash
                let lowerCaseName = cleanName.toLowerCase(); // Convert to lowercase for comparison
                // itemList.push({
                //   n: cleanName,
                //   path: `${fullPath}${encodeURIComponent(cleanName)}`, // Full URL for PDFs & folders
                //   type: isPDF ? "pdf" : isDOCX ? "docx" : "folder"
                // });

                // ✅ Detect the correct file type
                const fileType = itemName.endsWith("/") ? "folder" :
                  lowerCaseName.endsWith(".pdf") ? "pdf" :
                    itemName.endsWith(".csv") ? "csv" :
                      itemName.endsWith(".docx") ? "docx" :
                        itemName.endsWith(".xlsx") ? "xlsx" :
                          itemName.endsWith(".txt") ? "txt" :
                            "unknown"; // Default for other file types

                // ✅ Ensure correct path format (avoid double slashes)
                let path = `${fullPath}${cleanName}`.replace(/([^:]\/)\/+/g, "$1"); // Fix double slashes

                itemList.push({
                  n: cleanName,
                  path: path,
                  type: fileType
                });
              }
            }
          });

          //console.log("📂📄 Fetched Items:", itemList);
          res.json({ status: 'Done', data: itemList });

        } catch (error) {
          console.error("❌ Error processing response:", error);
          res.status(500).json({ error: "Failed to process response" });
        }
      });

    }).on('error', (error) => {
      console.error("❌ Error fetching directory contents:", error);
      res.status(500).json({ error: "Failed to fetch directory contents" });
    });
  });

  server.post('/backfolder', (req, res) => {
    //console.log("📥 Request Body:", req.body);

    let { cmp_name } = req.body

    // ✅ Ensure currentPath is defined and a string
    let currentPath: string = req.body.currentPath as string || '';

    if (!currentPath.trim()) {
      res.status(400).json({ error: "Missing or invalid currentPath in request" });
    }

    try {
      const baseUrl = config.baseURL;
      // const baseUrl = `${baseURL}${cmp_name}`;

      // ✅ Normalize and remove base URL from path
      currentPath = currentPath.replace(baseUrl, "").replace(/\/$/, "");

      let pathParts = currentPath ? currentPath.split('/') : [];
      if (pathParts.length === 0) {
        res.status(400).json({ error: "Invalid path structure" });
      }

      // ✅ Move up one directory
      pathParts.pop();
      let parentPath = pathParts.join('/');
      const parentURL = `${baseUrl}/${parentPath}/`;
      // const parentURL = `${baseUrl}/${parentPath}`.replace(/([^:]\/)\/+/g, "$1") + "/";


      //console.log(`🔄 Navigating back to: ${parentURL}`);

      http.get(parentURL, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const $ = cheerio.load(data);
            const itemList: any[] = [];

            $("a").each((_, element) => {
              let itemName = $(element).attr("href");

              if (itemName) {
                itemName = decodeURIComponent(itemName).trim();
                // const isPDF = itemName.toLowerCase().endsWith(".pdf");
                // const isDOCX = itemName.toLowerCase().endsWith(".docx");
                const isSortingLink = itemName.startsWith("?C=");
                const isParentDirectory = itemName === "../";
                const isBaseDir = itemName.includes("test_datasets"); // Remove base directory
                // ✅ Filter out unwanted items
                if (!isSortingLink && !isParentDirectory && !isBaseDir) {
                  let cleanName = itemName.replace(/\/$/, "");
                  let lowerCaseName = cleanName.toLowerCase(); // Convert to lowercase for comparison
                  // itemList.push({
                  //   n: cleanName,
                  //   path: `${parentURL}${encodeURIComponent(cleanName)}`,
                  //   type: isPDF ? "pdf" : isDOCX ? "docx" : "folder"
                  // });

                  // ✅ Detect the correct file type
                  const fileType = itemName.endsWith("/") ? "folder" :
                    lowerCaseName.endsWith(".pdf") ? "pdf" :
                      itemName.endsWith(".csv") ? "csv" :
                        itemName.endsWith(".docx") ? "docx" :
                          itemName.endsWith(".xlsx") ? "xlsx" :
                            itemName.endsWith(".txt") ? "txt" :
                              "unknown"; // Default for other file types

                  // ✅ Ensure correct path format (avoid double slashes)
                  let fullPath = `${parentURL}${cleanName}`.replace(/([^:]\/)\/+/g, "$1"); // Fix double slashes

                  itemList.push({
                    n: cleanName,
                    path: fullPath,
                    type: fileType
                  });
                }
              }
            });

            //console.log("📂📄 Fetched Items:", itemList);
            res.json({ status: 'Done', data: itemList });

          } catch (error) {
            console.error("❌ Error processing response:", error);
            res.status(500).json({ error: "Failed to process response" });
          }
        });

      }).on('error', (error) => {
        console.error("❌ Error fetching directory contents:", error);
        res.status(500).json({ error: "Failed to fetch folder contents" });
      });

    } catch (err) {
      console.error("❌ Error handling request:", err);
      res.status(500).json({ error: "Server error" });
    }
  });




  // To Get the second level
  server.post('/listfolder_second1', (req, res) => {
    //console.log("📥 Request Body:", req.body);
    const { folderPath } = req.body; // Extract folder path from request

    if (!folderPath) {
      res.status(400).json({ error: "Missing folderPath in request body" });
    }

    const fullPath = `${baseURL}${folderPath}/`; // Construct full URL

    //console.log(`🔎 Fetching contents from: ${fullPath}`);

    http.get(fullPath, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const $ = cheerio.load(data);
          const itemList = [];

          // 🔼 **Add Parent Directory Option** (Only if not in root)
          if (folderPath !== "") {
            const parentPath = folderPath.split('/').slice(0, -1).join('/');
            itemList.push({
              n: "Parent Directory",
              path: parentPath || "",  // If root, path is empty
              type: "parent"
            });
          }

          $("a").each((_, element) => {
            const itemName = $(element).attr("href");

            if (itemName) {
              const isPDF = itemName.endsWith(".pdf");
              const isDOCX = itemName.endsWith(".docx");
              const isParentDirectory = itemName === "../"; // Ignore actual parent directory link
              const isCurrentDirectory = itemName === "./"; // Ignore current directory
              const isSortingLink = itemName.startsWith("?C="); // Ignore sorting links

              // ✅ Filter out unwanted items
              if (!isParentDirectory && !isCurrentDirectory && !isSortingLink) {
                let cleanName = itemName.replace(/\/$/, ""); // Remove trailing slash

                itemList.push({
                  n: cleanName,
                  path: `${folderPath}/${cleanName}`, // Corrected path for navigation
                  type: isPDF ? "pdf" : isDOCX ? "docx" : "folder"
                });
              }
            }
          });

          //console.log("📂📄 Fetched Items:", itemList);
          res.json({ status: 'Done', data: itemList });

        } catch (error) {
          console.error("❌ Error processing response:", error);
          res.status(500).json({ error: "Failed to process response" });
        }
      });

    }).on('error', (error) => {
      console.error("❌ Error fetching directory contents:", error);
      res.status(500).json({ error: "Failed to fetch directory contents" });
    });
  });





  // pagelistdoc
  // ✅ Debugging Logs
  // ✅ Use a fixed path for `data.json`
  const DATA_FILE = "/root/loadURL/SiteAnalyzer/data.json";  // Fixed path outside `dist`
  //console.log("✅ __dirname:", __dirname);
  //console.log("✅ DATA_FILE path:", DATA_FILE);

  // **🔹 Helper function to read JSON data**
  const readData = () => {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        console.warn("⚠️ data.json not found. Creating a new one.");
        fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2)); // Create an empty file
        return {};
      }

      const rawData = fs.readFileSync(DATA_FILE, "utf-8");
      return rawData.trim() ? JSON.parse(rawData) : {}; // Handle empty file case
    } catch (error) {
      console.error("❌ Error reading data.json:", error);
      return {}; // Return empty object on error
    }
  };

  // **🔹 Helper function to write JSON data**
  const writeData = (data: object) => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("❌ Error writing to data.json:", error);
    }
  };



  // **🔹 API to Save Page Data**
  server.post('/pagelistdoc', (req, res) => {
    //console.log("📥 Received Request Body:", req.body);

    const { cmp_name, doc_name, pages } = req.body;

    // ✅ Validate input
    if (!cmp_name || !doc_name || !pages || !Array.isArray(pages)) {
      return res.status(400).json({ error: "Missing or invalid required fields", status: "Failed" });
    }

    const actualPath = `${config.baseURL}${cmp_name}/${doc_name}`;

    try {
      let data = readData();  // ✅ Read existing data

      // ✅ Initialize company array if not exists
      if (!Array.isArray(data[cmp_name])) {
        data[cmp_name] = [];
      }

      // ✅ Check if the document already exists
      const existingDocIndex = data[cmp_name].findIndex((doc: any) => doc.doc_name === doc_name);

      if (existingDocIndex !== -1) {
        // ✅ Update existing document
        data[cmp_name][existingDocIndex].pages = pages;
      } else {
        // ✅ Add new document
        data[cmp_name].push({
          doc_name,
          path: actualPath,
          pages
        });
      }

      writeData(data); // ✅ Save updated data

      //console.log("✅ Data Updated Successfully:", data);

      return res.json({ message: "Data saved successfully", status: "Done", data });
    } catch (error) {
      console.error("❌ Error saving data:", error);
      return res.status(500).json({ message: "Internal Server Error", status: "Failed" });
    }
  });

  server.post("/getpagelist", (req, res) => {
    //console.log("📥 Request to Get Data:", req.body);

    const { cmp_name, doc_name } = req.body;

    // **🔹 Validate Request Data**
    if (!cmp_name || !doc_name) {
      return res.status(400).json({ error: "Missing required fields", status: "Failed" });
    }

    try {
      const data = readData(); // ✅ Read stored data

      // **🔹 Check if Company Exists**
      if (!data[cmp_name] || !Array.isArray(data[cmp_name])) {
        return res.status(404).json({ message: "Company not found", status: "Not Found" });
      }

      // **🔹 Search for the document in the array**
      const docData = data[cmp_name].find((doc: any) => doc.doc_name === doc_name);

      if (docData) {
        return res.json({ message: "Pages Found", status: "Done", data: docData });
      } else {
        return res.status(404).json({ message: "No data found", status: "Not Found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", status: "Failed" });
    }
  });


  //for download pdf proxxy
  server.use('/misc', async (req, res) => {
    const targetUrl = `http://localhost${req.url}`; // Rewrite request
    //console.log(`Proxying request to: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      // ✅ Convert response to a buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ✅ Set proper content type
      res.setHeader('Content-Type', 'application/pdf');
      res.send(buffer);

    } catch (error) {
      console.error('Error proxying request:', error);
      res.status(500).send('Internal Server Error');
    }
  });


  //to get the data  accorfding to company
  server.post("/getcompnylist", (req, res) => {
    //console.log("📥 Request to Get Data:", req.body);

    const { cmp_name } = req.body;

    // **🔹 Validate Request Data**
    if (!cmp_name) {
      return res.status(400).json({ error: "Missing required cmp_name", status: "Failed" });
    }

    try {
      // Read the JSON file
      const rawData = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(rawData);

      // **🔹 Check if Data Exists for cmp_name**
      if (data[cmp_name]) {
        return res.json({ message: "Success", status: "Done", data: data[cmp_name] });
      } else {
        return res.status(404).json({ message: "No data found for the given cmp_name", status: "Not Found" });
      }
    } catch (error) {
      console.error("❌ Error retrieving data:", error);
      return res.status(500).json({ message: "Internal Server Error", status: "Failed" });
    }
  });





  server.post('/pagelistdoc__', (req, res) => {
    //console.log("req.body", req.body)
    const { cmp_name, tkr, doc_name, pages } = req.body;
    //console.log("Received Data:", cmp_name, tkr, doc_name, pages);
    const url = `http://localhost:9097/save_pages?cmp_name=${cmp_name}&tkr=${tkr}&doc_name=${doc_name}&pages=${pages}`;
    //console.log("url savedata", url, "\n", encodeURIComponent(url))
    // return
    http.get(url, (response) => {
      let data = '';

      // Handle each chunk of data
      response.on('data', (chunk: string) => {
        data += chunk;
      });

      // When the full response is received
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData); // Returns an array of tables
        } catch (error) {
          console.error('Error parsing JSON:', error);
          res.status(500).send('Error parsing response');
        }
      });
    }).on('error', (error: Error) => {
      console.error('Error fetching data:', error.message);
      res.status(500).send('Error fetching data');
    });
  });



  // isda_doc_config Rajat to get json 28-01-2025
  server.get('/isda_doc_config', (req, res) => {
    //console.log("isda_doc_config", req.body, "\n", req.query)
    var q = req.query
    //console.log("url", q['url'])
    // Parse the URL to extract the components
    const urlObj = new URL(q['url'] as string);
    //console.log("urlObj", urlObj)
    const options = {
      hostname: urlObj.hostname,  // The host IP address or domain
      port: urlObj.port,                 // The port number
      path: urlObj.pathname + urlObj.search,  // The API path with query parameters
      method: 'GET',              // The HTTP method
      rejectUnauthorized: false   // Disable certificate validation for testing (not recommended for production)
    };
    //console.log("options", options)
    http.get(options, (response) => {
      let data = '';

      response.on('data', (chunk: string) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          //console.log("ApiCall__", jsonData);
          res.json(jsonData);  // Return the JSON response
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });
    }).on('error', (error: Error) => {
      console.error('Error fetching data:', error.message);
      res.status(500).json({ error: error.message });  // Handle the error gracefully
    });
  });


  server.get('/webAPI', (req, res) => {
    //console.log("webapi", req.body, "\n", req.query)
    var q = req.query
    //console.log("url", q['url'])
    // Parse the URL to extract the components
    const urlObj = new URL(q['url'] as string);
    //console.log("urlObj", urlObj)
    const options = {
      hostname: urlObj.hostname,  // The host IP address or domain
      port: urlObj.port,                 // The port number
      path: urlObj.pathname + urlObj.search,  // The API path with query parameters
      method: 'GET',              // The HTTP method
      rejectUnauthorized: false   // Disable certificate validation for testing (not recommended for production)
    };
    //console.log("options", options)
    https.get(options, (response) => {
      let data = '';

      response.on('data', (chunk: string) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          //console.log("ApiCall__", jsonData);
          res.json(jsonData);  // Return the JSON response
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });
    }).on('error', (error: Error) => {
      console.error('Error fetching data:', error.message);
      res.status(500).json({ error: error.message });  // Handle the error gracefully
    });
  });

  // Post Data
  server.post('/postdata', (req, res) => {
    //console.log("req.body postdata", req.body)
    const { doc_id1, doc_id2, flg, leftblock, rightblock } = req.body;
    //console.log("Received Data:", { doc_id1, doc_id2, flg, leftblock, rightblock });
    // var pd = {'doc_id1': this.selcted_drp_doc, "doc_id2": this.selcted_drp_doc1, 'flg': 1, 'leftblock': this.getDoc_typeInfo1, 'rightblock': this.getDoc_typeInfo2 }
    var url = `http://172.16.20.241/save_metadata?doc_id1=${doc_id1}&doc_id2=${doc_id2}&flg=${flg}&leftblock=${encodeURIComponent(leftblock)}&rightblock=${encodeURIComponent(rightblock)}`
    //console.log("url", url)
    return
    http.get(url, (response) => {
      let data = '';

      // Handle each chunk of data
      response.on('data', (chunk: string) => {
        data += chunk;
      });

      // When the full response is received
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData); // Returns an array of tables
        } catch (error) {
          console.error('Error parsing JSON:', error);
          res.status(500).send('Error parsing response');
        }
      });
    }).on('error', (error: Error) => {
      console.error('Error fetching data:', error.message);
      res.status(500).send('Error fetching data');
    });
  })

  // Rajat Ranjan 22-01-2025
  server.post('/savedata_anno', (req, res) => {
    //console.log("req.body", req.body)
    const { cmp_name, tkr, doc_name, doc_mar } = req.body;
    //console.log("Received Data:", cmp_name, tkr, doc_name, doc_mar);
    const url = `http://localhost:9097/save_metadata?cmp_name=${cmp_name}&tkr=${tkr}&doc_name=${doc_name}&doc_mar=${doc_mar}`;
    //console.log("url savedata", url, "\n", encodeURIComponent(url))
    // return
    http.get(url, (response) => {
      let data = '';

      // Handle each chunk of data
      response.on('data', (chunk: string) => {
        data += chunk;
      });

      // When the full response is received
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData); // Returns an array of tables
        } catch (error) {
          console.error('Error parsing JSON:', error);
          res.status(500).send('Error parsing response');
        }
      });
    }).on('error', (error: Error) => {
      console.error('Error fetching data:', error.message);
      res.status(500).send('Error fetching data');
    });
  });
  // Rajat Ranjan Upload file 23-01-2025
  // server.post('/upload',(req,res)=>{
  //   //console.log("req.body", req.body)
  //   const { file, result,file1,file2 } = req.body;
  //   //console.log("Received Data:", file, result,file1,file2);
  //   const url = `http://localhost:9097/add_comp?&data=${result}&file=${file}`;
  //   //console.log("url savedata", url,"\n",encodeURIComponent(url))
  //   return
  //   http.get(url, (response) => {
  //     let data = '';

  //     // Handle each chunk of data
  //     response.on('data', (chunk: string) => {
  //       data += chunk;
  //     });

  //     // When the full response is received
  //     response.on('end', () => {
  //       try {
  //         const jsonData = JSON.parse(data);
  //         res.json(jsonData); // Returns an array of tables
  //       } catch (error) {
  //         console.error('Error parsing JSON:', error);
  //         res.status(500).send('Error parsing response');
  //       }
  //     });
  //   }).on('error', (error: Error) => {
  //     console.error('Error fetching data:', error.message);
  //     res.status(500).send('Error fetching data');
  //   });
  // })



  server.get(rootPath + '/getDataPDF', (req, res) => {
    //console.log('getDataPDF is running')
    var q = req.query;
    //  w = req.query.Docs;
    //console.log('getData req.query q', '\n', q, '\nreq.originalUrl', req.originalUrl)
    var url = new URL(decodeURIComponent(req.originalUrl.split('/getDataPDF?')[1] as string))
    // var opath = `/dataSroreAPI?projid=${q['projid']}&docid=${q['docid']}&pgno=${q['pgno']}&get=${q['get']}`
    // //console.log("opat", opath)
    var options = {
      host: url.hostname,//in setting setting.datastoreIP is not define
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET'
    }
    //console.log('%cserver.ts:179 options', 'color: #007acc;', options);
    var request = http.request(options, function (resp) {
      let data: any = [];

      resp.on('data', function (chunk) {
        data.push(chunk);
      });

      resp.on('end', function () {
        const buffer = Buffer.concat(data);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': buffer.length,
          'Content-Disposition': 'inline; filename="file.pdf"',
        });
        res.end(buffer);
      });
    });

    request.on('error', function (e) {
      //console.log("Error: ", e.message);
      res.status(500).send('Internal Server Error');
    });

    request.end();
  })
  server.get(rootPath + '/getpdfpage_data', (req, res) => {
    //console.log('getData is running', req)
    // http://172.16.20.120:9099/get_formatHTML?projid=3&docid=100&pgno=1
    //var opath = `/dataSroreAPI?projid=${q.projid}&docid=${q.docid}&pgno=${q.pgno}&get=${q.get}`
    var q = req.query;
    //console.log('getData is running 222', q)
    //console.log('getData is get the vale q >>>>', '\n', q, '\n')
    var opath = `/getpdfpage?projid=${q['projid']}&batchname=${q['batchname']}&docid=${q['docid']}&pgno=${q['pgno']}`
    // var opath = `/dataSroreAPI?projid=${q.projid}&docid=${q.docid}&pgno=${q.pgno}&get=${q.get}`
    // var opath = `/dataSroreAPI?projid=10000&docid=148593&pgno=3&get=pdfpagedata`
    ///formattedpage?projid=10099&batchname=03mar&docid=153976&pgno=1:613:41
    //console.log("opat pdf", opath)
    var options = {
      host: '172.16.20.120',//in setting setting.datastoreIP is not define
      port: 9097,
      path: opath,
      method: 'GET'
    }
    //console.log("option", options)
    var request = http.request(options, function (resp) {
      var data: any = [];
      resp.on('data', function (chunk) {
        data.push(chunk);
      });
      resp.on('end', function () {
        var binary = Buffer.concat(data);
        //console.log("binary", binary)
        res.send(binary)
      });
    });
    request.on('error', function (e) {
      //console.log("eEE : ", e.message);
    });

    request.end();
  })

  server.get(rootPath + '/gethtmlpage_data', (req, res) => {
    //console.log('getData is running', req)
    // http://172.16.20.120:9099/get_formatHTML?projid=3&docid=100&pgno=1
    //var opath = `/dataSroreAPI?projid=${q.projid}&docid=${q.docid}&pgno=${q.pgno}&get=${q.get}`
    var q = req.query;
    //console.log('gethtmlpage_data is running 222', q)
    //console.log('getData is get the vale q >>>>', '\n', q, '\n')
    var opath = `/formattedpage?projid=${q['projid']}&batchname=${q['batchname']}&docid=${q['docid']}&pgno=${q['pgno']}`
    // var opath = `/dataSroreAPI?projid=${q.projid}&docid=${q.docid}&pgno=${q.pgno}&get=${q.get}`
    // var opath = `/dataSroreAPI?projid=10000&docid=148593&pgno=3&get=pdfpagedata`
    ///formattedpage?projid=10099&batchname=03mar&docid=153976&pgno=1:613:41
    //console.log("opat pdf", opath)
    var options = {
      host: '172.16.20.120',//in setting setting.datastoreIP is not define
      port: 9097,
      path: opath,
      method: 'GET'
    }
    var request = http.request(options, function (resp) {
      var data: any = [];
      resp.on('data', function (chunk) {
        data.push(chunk);
      });
      resp.on('end', function () {
        var binary = Buffer.concat(data);
        //console.log("binary", binary)
        res.send(binary)
        // //console.log("res",res)
      });
    });
    request.on('error', function (e) {
      //console.log("eEE : ", e.message);
    });

    request.end();
  })
  server.get(rootPath + '/requestObject', (req, res) => {
    // //console.log('getData is running', req)

    // http://172.16.20.120:9099/get_formatHTML?projid=3&docid=100&pgno=1
    var url = req.originalUrl;
    //console.log('getData is running request', url, req.query)
    //console.log('req.url', req.url);
    var q = req.query
    var path
    // if(q['get']=='companies')
    //   path = '/companies'
    // else if(q['get']=='compfiles')
    //   path = '/compfiles?'+(encodeURIComponent(q['q']as string))
    // var options = {
    //   host: '172.16.20.241',//in setting setting.datastoreIP is not define
    //   port: 9099,
    //   // path: opath,
    //   path: path,
    //   method: 'GET'
    // }
    // //console.log("option", options)
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";
    fetch(q['url'] as string).then((response) => {
      //console.log('%cserver.ts:192 response', 'color: #007acc;', response);
      try {
        return response.json()
      } catch (e) {
        res.send(e)
        return
      }
    })
      // Showing response
      .then((json) => {
        //console.log(json)
        res.send(json)
      })
      .catch(err => {
        //console.log('%cserver.ts:274 err', 'color: #007acc;', err);
        res.status(500).send({ message: err })
      })
    // var request = http.request(options, function (resp) {
    //   //console.log('%cserver.ts:186 resp', 'color: #007acc;', Object.keys(resp), resp.json());
    //   // res.send(['resp.data'])
    // });
    // request.on('error', function (e) {
    //   //console.log("eEE : ", e.message);
    // });
    // request.end();
  })

  server.get(rootPath + '/apiChecker', (req, res) => {
    var url = req.originalUrl;
    //console.log('getData is running request', url, req.query)
    //console.log('req.url', req.url);
    var q = req.query
    fetch(q['url'] as string).then((response) => {
      //console.log('%cserver.ts:192 response', 'color: #007acc;', response);
      try {
        return response
      }
      catch (e) {
        res.send(false)
        //console.log('then 111 eee', e)
        return false
      }
    })
      // Showing response
      .then((json) => {
        //console.log('then 22222-------------', json)
        res.send(true)
      })
      .catch(err => {
        //console.log(err)
        res.send(false)
        //console.log('then 111 eee', err)
        return false
      })
  })

  server.get(rootPath + '/request', (req, res) => {
    // //console.log('getData is running', req)

    // http://172.16.20.120:9099/get_formatHTML?projid=3&docid=100&pgno=1
    var q = req.originalUrl;
    //console.log('getData is running request', q)
    //console.log('req.url', req.url);
    // const pathAndQuery = url.pathname + url.search;
    // //console.log(pathAndQuery);
    const urlObj = req.url;

    // //console.log('getData is get the vale q', '\n', q, "\n", ">>>>>>", req.socket, "}}{{{", req.originalUrl)
    // let urlObj = Url.parse(req.url, true);
    // let urlObj= Url.parse(req.url);
    // Url.parse()
    //console.log("urlObj", urlObj)
    // //console.log("urlObj",urlObj.search)
    var url2 = urlObj
    if (url2.startsWith("?")) {
      url2 = url2.substring(1);
    }
    url2 = url2.split('/request?')[1]
    //console.log("urlObj", url2)
    // const urlObj2 = Url.parse(url2,true)
    const urlObj2 = new URL(url2);

    //console.log("urlObj", urlObj2.hostname, urlObj2.port, urlObj2)
    // const hostnameMatch = urlObj.search.match(/hostname=([^&]*)/);
    // const portMatch = q.match(/port=([^&]*)/);
    // const urlMatch = q.match(/url=([^&]*)/);
    // const urlMatch = q.searchParams.get('url');

    // //console.log("urlObj",urlMatch)

    // const hostname = hostnameMatch ? hostnameMatch[1] : '';
    // const port = portMatch ? portMatch[1] : '';
    // const url = urlMatch ? urlMatch[1] : '';

    // //console.log(hostname); // Output: 172.16.20.120
    // //console.log(port); // Output: 9097
    // //console.log(url); // Output: formattedpage?projid=10099&batchname=03mar&docid=153967&pgno=75
    var options = {
      host: urlObj2.hostname,//in setting setting.datastoreIP is not define
      port: urlObj2.port,
      // path: opath,
      path: urlObj2.pathname + urlObj2.search,
      method: 'GET'
    }
    //console.log("option", options)
    var request = http.request(options, function (resp) {
      var data = '';
      resp.on('data', function (chunk) {
        data += chunk;
      });
      resp.on('end', function () {
        res.send(data)
      });
    });
    request.on('error', function (e) {
      //console.log("eEE : ", e.message);
    });
    request.end();
  })
  server.get(rootPath + "/api/ag-grid", (req, res) => {
    //Here are the option object in which arguments can be passed for the python_test.js.
    let options: any = {
      mode: 'text',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: 'pysrc_bk/', //If you are having python_test.py script in same folder, then it's optional.
      args: ['Rajat Ranjan'] //An argument which can be accessed in the script using sys.argv[1]
    };

    PythonShell.run('pysrc.py', options).then((data: any) => {
      // results is an array consisting of data collected during execution
      // //console.log('results: %j', data.toString());
      res.send(data.toString())
    });
  });
  server.get(rootPath + '/post_method', (req, res) => {
    //console.log('post_method++++++++++++++++++++++++++++ ')
    //Here are the option object in which arguments can be passed for the python_test.js.
    // //console.log('post_method ', req.body)
    // //console.log('post_method_req ', req.body.params.updates[0].value)

    var input_data = req.body.params.updates[0].value
    /*  var options = {
       mode: 'json',
       pythonPath: 'python',
       pythonOptions: [],
       scriptPath: 'pysrc/',
       args: [input_data]
   }; */
    let options: any = {
      mode: 'json',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: 'pysrc_v1/', //If you are having python_test.py script in same folder, then it's optional.
      args: [input_data] //An argument which can be accessed in the script using sys.argv[1]
    };
    //console.log('%crefComponent_v3/server.ts:65 options', 'color: #007acc;', options);
    PythonShell.run('web_api.py', options)
      .then((data: any) => {
        // results is an array consisting of data collected during execution
        // //console.log('results: %j', data);
        res.send(data[0])
      })
      .catch(e => {
        res.send({ message: ['Error in CGI ' + JSON.parse(input_data)['cmd_id']], error: e })
        //console.log('%crefComponent_v3/server.ts:70 e', 'color: #007acc;', e)
      });
  });

  async function* getFiles(dir: any): any {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* getFiles(res);
      } else {
        yield res;
      }
    }
  }


  server.get(rootPath + "/codediff", async (req, res) => {
    var { path1, port1, path2, port2, match } = req.query
    var diffdata = ''
    var diffdatasend = ''
    for await (const f of getFiles(path1 as string + match as string)) {
      if (!f.includes('spec')) {
        diffdata += `code -d "${f}" "${path2}${match}${f.split(match)[1]}"\n`
        diffdatasend += `code -d "${f}" "${path2}${match}${f.split(match)[1]}"<br/>`
      }
    }
    //console.log('%cserver.ts:412 diffdata', 'color: #007acc;', diffdata);
    fs.writeFile(`${port1}diff${port2}.txt`, diffdata, (err) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully\n");
        res.send(diffdatasend)
      }
    });
  });

  server.get(rootPath + '/writeFavicon', (req, res) => {
    //console.log('%cserver.ts:348 req.body', 'color: #007acc;', req.body, req.query);
    // fs.writeFile(folderPaths.varWwwHtml+`icons/favicon.svg`, JSON.parse(req.body.params.updates[0].value).svg, (err: any) => {
    if (!fs.existsSync(path.resolve('src/assets/logos/'))) {
      //console.log('%cHello server.ts:308 mkdir', 'background: green; color: white; display: block;');
      fs.mkdirSync(path.resolve('src/assets/logos/'), { recursive: true });
    }
    fs.writeFile(path.resolve('src/assets/logos/' + req.body.name), req.body.svg, (err: any) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully\n");
        res.send({ message: 'done', icons: fs.readdirSync(path.resolve('src/assets/logos')) })
      }
    });
  });

  server.get(rootPath + "/getFavicon", async (req, res) => {
    //console.log('%cserver.ts:506 ', 'color: #007acc;', path.resolve('src/assets/logos/' + req.query['icon']));
    // res.sendFile(folderPaths.varWwwHtml+'icons/favicon.svg')
    // res.sendFile(path.resolve('src/assets/logos/'+req.query['icon']))
    res.sendFile(path.resolve('src/assets/logos/favicon.svg'))
  });

  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html: any) => res.send(html))
      .catch((err: any) => next(err));
  });

  server.get('/files/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = join(__dirname, 'uploads', fileName);
    res.sendFile(filePath);
  });
  const storage = multer.diskStorage({

    destination: function (req: any, file: any, cb: any) {
      // var path = folderPaths.varWwwHtml + 'upload/' + req.query['folder']
      var path = req.query['folder']
      var dirs = getDirectories(path).then(d => {
        //console.log('%cserver.ts:304 d', 'color: #007acc;', d);
      })

      if (!fs.existsSync(path)) {
        //console.log('%cHello server.ts:308 mkdir', 'background: green; color: white; display: block;');
        fs.mkdirSync(path, { recursive: true });
      }
      //console.log('Destination folder:', req.body, path, file, fs.existsSync(path + '/' + file), dirs)
      // if (!fs.existsSync(dir)){
      //   fs.mkdirSync(dir, { recursive: true });
      // }
      //some logics
      cb(null, path)
    },

    filename: function (req: any, file: any, cb: any) {
      //console.log('Original filename:', file.originalname);
      cb(null, file.originalname/* .replace(/\.[^/.]+$/, "") + '_' + Date.now() + path.extname(file.originalname) */)
    }
  })
  let maxSize = 1 * 1000 * 1000

  const getDirectories = async (source: any) =>
    (await readdir(source, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

  const upload = multer({
    storage: storage,
    // limits: {
    //   fileSize: maxSize
    // },
    fileFilter: function (req: any, file: any, cb: any) {
      //console.log('Uploaded file:', file, req.body);
      let filetypes = /pdf/;
      let mimetype = filetypes.test(file.mimetype);
      let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      // var p = folderPaths.varWwwHtml + 'upload/' + req.query['folder'] + '/' + req.query['filename']
      var p = req.query['folder'] + '/' + req.query['filename']

      //console.log('%cserver.ts:355 fs.existsSync(path)', 'color: #007acc;', p, req.query, fs.existsSync(p), fs.existsSync('/root/upload/codeDiff.txt'), "\n", mimetype, extname);
      return cb(null, true);
    }
  }).single('myDoc');



  var api = new APIConfig()
  server.post('/upload', (req, res, next) => {
    // //console.log('%cserver.ts:351 req', 'color: #007acc;', req);
    //console.log('%cserver.ts:348 req.body', 'color: #007acc;', req.body, req.query);
    upload(req, res, function (err: any) {
      if (err) {
        console.error("Upload failed:", err);
        if (err.code == "LIMIT_FILE_SIZE") {
          console.error("Maximum file size limit exceeded");
          res.status(400).json({ error: "Maximum file size limit exceeded" });
        }
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      } else {
        //console.log("File uploaded successfully");
        res.status(200).json({ status: "Done" });
        // var url = api.uploadFilesURL(req.query['folder'], req.query['filename'])
        // // var url = `http://172.16.20.241:9099/uploadfile?compname=${encodeURIComponent(req.query['folder'] as string)}&filename=${encodeURIComponent(req.query['filename'] as string)}`
        // //console.log('%cserver.ts:377 url', 'color: #007acc;', url);
        // fetch(url).then((response) => response.json())
        //   // Showing response
        //   .then((json) => {
        //     //console.log(json)
        //     // res.send(json)
        //     if (json[0] == 'done')
        //       res.status(200).json({ message: "File uploaded successfully" });
        //     else res.status(500).json({ message: "no" });
        //   })
        //   .catch(err => //console.log(err))
      }
    });
  });

  // server.get('/get_companies', (req, res) => {
  //   // //console.log('%cserver.ts:351 req', 'color: #007acc;', req);
  //   //console.log('%cserver.ts:348 req.body', 'color: #007acc;', req.body, req.query);
  //   var companies = 'http://172.16.20.241:9099/companies'
  //   var options = {
  //     host: '172.16.20.241',//in setting setting.datastoreIP is not define
  //     port: 9099,
  //     path: '/companies',
  //     method: 'GET'
  //   }
  //   //console.log('%cserver.ts:379 options', 'color: #007acc;', options);
  //   var request = http.request(options, function (resp) {
  //     //console.log('%cserver.ts:380 resp', 'color: #007acc;', resp);
  //     res.send(resp)
  //   });
  //   request.on('error', function (e) {
  //     //console.log("eEE : ", e.message);
  //   });
  // })
  server.get(rootPath + '/get_files', (req, res) => {
    // //console.log('%cserver.ts:351 req', 'color: #007acc;', req);
    //console.log('%cserver.ts:348 req.body', 'color: #007acc;', req.body, req.query);
    var files = 'http://172.16.20.241:9099/compfiles?compname=%22Test%20company%22'
    var options = {
      host: '172.16.20.241',//in setting setting.datastoreIP is not define
      port: 9099,
      path: '/compfiles?compname=' + req.query['compname'],
      method: 'GET'
    }
    var request = http.request(options, function (resp) {
      //console.log('%cserver.ts:398 resp', 'color: #007acc;', resp);
      res.send(resp)
    });
    request.on('error', function (e) {
      //console.log("eEE : ", e.message);
    });
  })


  return server;
}

var httpsServer: any;
var io: any;
var int: any;

function run(): void {
  const server = app();

  // Run plain HTTP server instead of HTTPS
  httpsServer = server.listen(PORT, function () {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });

  io = new Server(httpsServer);

  io.on('connection', (socket: { id: any }) => {
    //console.log(`new connection id: ${socket.id}`);
    if (!int)
      int = interval(5000).subscribe(() => {
        return io.emit('getFilesInterval', true);
      });
  });
}

run();
