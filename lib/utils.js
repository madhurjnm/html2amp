const axios = require('axios');
const fs = require('fs');
const path = require('path');

const srcNode = async (cwd, attributes) => {
  const { src, alt = '', width, height, ...attrs } = attributes;
  const url = normalizeUrl(normalizeSrc(src, attributes.srcset));

  // Check if width and height attributes are provided
  if (width && height) {
    // Use provided width and height attributes directly
    const _attrsStr = Object.keys(attrs)
      .map(key => `${key}="${attrs[key]}"`)
      .join(' ');

    return `<amp-img src="${url}" alt="${alt}" width="${width}" height="${height}" layout="responsive" ${_attrsStr}></amp-img>`;
  }else{
    return `<amp-img src="${url}" alt="${alt}" layout="responsive" ></amp-img>`;
  }
}

const normalizeUrl = (url) => {
  if (url.startsWith('http')) {
    return url
  } else if (url.startsWith('//')) {
    return `https:${url}`
  } else if (url.startsWith('data:')) {
    return url
  } else {
    // relative file path excluding query parameters and hash
    return url.split('?')[0].split('#')[0]
  }
}

const remoteFileCaches = new Map()
async function getRemoteFile (url, options = {}) {
  try {
    if (remoteFileCaches.has(url)) return remoteFileCaches.get(url)
    const file = await axios.get(url, options).then(response => response.data)
    remoteFileCaches.set(url, file)
    return file
  } catch (e) {
    console.error(`Fetching ${url} failed.`)
  }
}

const getRelativeFile = (url, cwd) => {
  const filePath = path.join(cwd, url)
  try {
    if (fs.existsSync(filePath)) {
      return String(fs.readFileSync(filePath))
    } else {
      throw new Error()
    }
  } catch (e) {
    console.error(`Reading ${filePath} failed.`)
  }
}

const normalizeSrc = (src, srcset) => {
  if (src) return src
  const set = srcset.split(',')[0]
  return set.split(' ')[0]
}


module.exports = {
  normalizeUrl: normalizeUrl,
  getRemoteFile: getRemoteFile,
  getRelativeFile: getRelativeFile,
  srcNode: srcNode
}
