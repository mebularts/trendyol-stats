function formatNumber(numberStr) {
  if (numberStr.includes('B')) {
    return parseFloat(numberStr) * 1e3;
  } else if (numberStr.includes('M')) {
    return parseFloat(numberStr) * 1e6;
  } else if (numberStr.includes('K')) {
    return parseFloat(numberStr) * 1e9;
  } else {
    return parseFloat(numberStr);
  }
}

function collectProductStats() {
  const products = document.querySelectorAll('.p-card-wrppr');
  let productStats = [];

  products.forEach((product) => {
    const titleElement = product.querySelector('.prdct-desc-cntnr-ttl');
    const nameElement = product.querySelector('.prdct-desc-cntnr-name');
    const urlElement = product.querySelector('.p-card-chldrn-cntnr.card-border a');
    const imageElement = product.querySelector('.p-card-img');
    const priceElement = product.querySelector('.prc-box-dscntd');
    const favoriteElement = product.querySelector('.social-proof-text .focused-text');
    const addToCartElement = product.querySelectorAll('.social-proof-text')[1]?.querySelector('.focused-text');

    if (titleElement && nameElement && urlElement && imageElement && priceElement && favoriteElement && addToCartElement) {
      const title = titleElement.textContent.trim();
      const name = nameElement.textContent.trim();
      const url = urlElement.getAttribute('href');
      const imageUrl = imageElement.src;
      const price = priceElement.textContent.trim();
      const favorites = formatNumber(favoriteElement.textContent.replace(' kişi ', '').trim());
      const addedToCart = formatNumber(addToCartElement.textContent.replace(' kişi ', '').trim());

      const salesEstimate = addedToCart * 0.16;

      productStats.push({
        title,
        name,
        url,
        imageUrl,
        price,
        favorites,
        sales: salesEstimate
      });
    }
  });


  productStats.sort((a, b) => b.favorites - a.favorites);
  return productStats.slice(3, 10);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    const stats = collectProductStats();
    sendResponse(stats);
  }
});
