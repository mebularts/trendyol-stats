document.getElementById('fetchStats').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATS' }, (response) => {
      if (response) {
        displayStats(response);
      } else {
        alert('Veriler alınamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
      }
    });
  });
});

let currentProductIndex = 0;
const productsPerPage = 5;

function displayStats(products) {
  const container = document.getElementById('productList');
  container.innerHTML = '';

  const productsToShow = products.slice(currentProductIndex, currentProductIndex + productsPerPage);

  productsToShow.forEach((product) => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.addEventListener('click', () => {
      const fullUrl = 'https://www.trendyol.com' + product.url;
      window.open(fullUrl, '_blank');
    });

    const image = document.createElement('img');
    image.src = product.imageUrl;
    image.alt = product.name;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'product-details';

    const name = document.createElement('h2');
    name.textContent = product.name;

    const price = document.createElement('p');
    price.textContent = `Fiyat: ${product.price}`;

    const favorites = document.createElement('p');
    favorites.textContent = `Favori Sayısı: ${product.favorites}`;

    const sales = document.createElement('p');
    sales.textContent = `Satış Sayısı: ${product.sales}`;

    const monthlyPopularity = document.createElement('p');
    monthlyPopularity.textContent = `Aylık Popülarite: ${product.monthlyPopularity}`;

    const dailyViews = document.createElement('p');
    dailyViews.textContent = `Günlük Görüntülenme: ${product.dailyViews}`;

    detailsDiv.appendChild(name);
    detailsDiv.appendChild(price);
    detailsDiv.appendChild(favorites);
    detailsDiv.appendChild(sales);
    detailsDiv.appendChild(monthlyPopularity);
    detailsDiv.appendChild(dailyViews);

    productDiv.appendChild(image);
    productDiv.appendChild(detailsDiv);

    container.appendChild(productDiv);
  });

  currentProductIndex += productsPerPage;

  if (currentProductIndex >= products.length) {
    document.getElementById('showMore').style.display = 'none';
  } else {
    document.getElementById('showMore').style.display = 'block';
  }

  createChart(products.slice(0, currentProductIndex));
}

function createChart(products) {
  const ctx = document.getElementById('chart').getContext('2d');
  const labels = products.map((product) => product.name);
  const salesData = products.map((product) => product.sales);
  const favoritesData = products.map((product) => product.favorites);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Satış Sayısı',
          data: salesData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Favori Sayısı',
          data: favoritesData,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

document.getElementById('showMore').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATS' }, (response) => {
      if (response) {
        displayStats(response);
      } else {
        alert('Veriler alınamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
      }
    });
  });
});

document.getElementById('downloadPdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let y = 10;

  const products = document.querySelectorAll('.product');
  const promises = Array.from(products).map((product) => {
    return new Promise((resolve) => {
      const image = product.querySelector('img');
      const name = product.querySelector('h2').textContent;
      const price = product.querySelector('p:nth-child(2)').textContent;
      const favorites = product.querySelector('p:nth-child(3)').textContent;
      const sales = product.querySelector('p:nth-child(4)').textContent;
      const monthlyPopularity = product.querySelector('p:nth-child(5)').textContent;
      const dailyViews = product.querySelector('p:nth-child(6)').textContent;

      if (image) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = image.src;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imgData = canvas.toDataURL('image/png');
          resolve({ imgData, name, price, favorites, sales, monthlyPopularity, dailyViews });
        };
      } else {
        resolve({ imgData: null, name, price, favorites, sales, monthlyPopularity, dailyViews });
      }
    });
  });

  Promise.all(promises).then((results) => {
    results.forEach(({ imgData, name, price, favorites, sales, monthlyPopularity, dailyViews }) => {
      if (imgData) {
        pdf.addImage(imgData, 'PNG', 10, y, 50, 50);
      }
      pdf.text(70, y + 10, name);
      pdf.text(70, y + 20, price);
      pdf.text(70, y + 30, favorites);
      pdf.text(70, y + 40, sales);
      pdf.text(70, y + 50, monthlyPopularity);
      pdf.text(70, y + 60, dailyViews);

      y += 70;

      if (y > 270) {
        pdf.addPage();
        y = 10;
      }
    });

    pdf.save('istatistikler.pdf');
  });
});
