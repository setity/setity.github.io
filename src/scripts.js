let textContent = '';

document.getElementById('loadFileButton').addEventListener('click', function () {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      textContent = e.target.result;
      // 清空内容和分页按钮
      document.getElementById('content').innerHTML = '';
      document.getElementById('pageButtons').innerHTML = '';
      document.getElementById('searchResults').innerHTML = '';
      // 检测设备类型
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const wordsPerPage = isMobile ? 6000 : 10000; // 根据设备类型设置每页字数
      let pagesHTML = '';
      let paragraphsArray = textContent.split('\n');
      let currentPageLength = 0;
      let currentPageContentHTML = '';
      let currentPageNumber = 1;
      for (let i = 0; i < paragraphsArray.length; i++) {
        currentPageContentHTML += '<p>' + paragraphsArray[i] + '</p>';
        currentPageLength += paragraphsArray[i].length;
        if (currentPageLength >= wordsPerPage) {
          pagesHTML += '<div class="page" id="page' + currentPageNumber + '">' + currentPageContentHTML + '</div>';
          currentPageLength = 0;
          currentPageContentHTML = '';
          currentPageNumber++;
        }
      }
      if (currentPageContentHTML !== '') {
        pagesHTML += '<div class="page" id="page' + currentPageNumber + '">' + currentPageContentHTML + '</div>';
      }
      document.getElementById('content').innerHTML = pagesHTML;
      // 隐藏文件选择区域和页面标题
      document.getElementById('fileSelection').style.display = 'none';
      document.getElementById('pageTitle').style.display = 'none';
      document.getElementById('readme').style.display = 'none';
      // 获取文件名，并使用文件名作为键来存储页码
      const fileName = file.name;
      const savedPage = localStorage.getItem(fileName + '_currentPage');
      if (savedPage) {
        showPage(parseInt(savedPage));
      } else {
        showPage(1); // 显示第一页
      }
    };
    reader.readAsText(file);
  }
});

function showPage(pageNumber) {
  // 隐藏所有页面
  const pages = document.getElementsByClassName('page');
  for (let i = 0; i < pages.length; i++) {
    pages[i].style.display = 'none';
  }
  // 显示指定页面
  const page = document.getElementById('page' + pageNumber);
  if (page) {
    page.style.display = 'block';
  }
  // 更新页数显示
  const pageButtons = document.getElementsByClassName('pageButton');
  for (let i = 0; i < pageButtons.length; i++) {
    pageButtons[i].classList.remove('currentPage');
  }
  // 获取当前文件名，并使用文件名作为键来存储页码
  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length > 0) {
    const fileName = fileInput.files[0].name;
    localStorage.setItem(fileName + '_currentPage', pageNumber);
  }
  // 更新页码显示
  updatePageButtons(pageNumber);
  // 定位到页面最上方
  window.scrollTo(0, 0);
  // 显示提示信息
  const scrollInfo = document.getElementById('scrollInfo');
  scrollInfo.textContent = `第 ${pageNumber} 页，朗读请点击地址栏末尾的朗读按钮`;
  scrollInfo.style.color = 'red'; // 设置颜色为红色
  scrollInfo.style.fontWeight = 'bold'; // 加粗显示
  // 设置定时器，在4秒后隐藏提示信息
  setTimeout(function () {
    scrollInfo.textContent = '';
  }, 4000);
  // 隐藏搜索结果
  document.getElementById('searchResults').innerHTML = '';
}


function updatePageButtons(currentPage) {
  const pageButtonsDiv = document.getElementById('pageButtons');
  const totalPages = document.getElementsByClassName('page').length;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const visiblePages = isMobile ? 3 : 5; // 根据设备类型设置每页字数
  pageButtonsDiv.innerHTML = '';

  // 添加上一页按钮
  if (totalPages > 1 && currentPage > 1) {
    const prevButton = document.createElement('span');
    prevButton.classList.add('pageButton');
    prevButton.innerText = '上一页';
    prevButton.addEventListener('click', function () {
      showPage(currentPage - 1);
    });
    pageButtonsDiv.appendChild(prevButton);
  }

  // 当前页及前后2个页码
  let startPage = currentPage - Math.floor(visiblePages / 2);
  let endPage = currentPage + Math.floor(visiblePages / 2);
  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(totalPages, visiblePages);
  }
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - visiblePages + 1);
  }
  if (startPage > 1) {
    const firstPageButton = document.createElement('span');
    firstPageButton.classList.add('pageButton');
    firstPageButton.innerText = '1';
    firstPageButton.addEventListener('click', function () {
      showPage(1);
    });
    pageButtonsDiv.appendChild(firstPageButton);
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.innerText = '...';
      pageButtonsDiv.appendChild(ellipsis);
    }
  }
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('span');
    pageButton.classList.add('pageButton');
    pageButton.innerText = i;
    if (i === currentPage) {
      pageButton.classList.add('currentPage');
    }
    pageButton.addEventListener('click', function () {
      showPage(i);
    });
    pageButtonsDiv.appendChild(pageButton);
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.innerText = '...';
      pageButtonsDiv.appendChild(ellipsis);
    }
    const lastPageButton = document.createElement('span');
    lastPageButton.classList.add('pageButton');
    lastPageButton.innerText = totalPages;
    lastPageButton.addEventListener('click', function () {
      showPage(totalPages);
    });
    pageButtonsDiv.appendChild(lastPageButton);
  }

  // 添加下一页按钮
  if (totalPages > 1 && currentPage < totalPages) {
    const nextButton = document.createElement('span');
    nextButton.classList.add('pageButton');
    nextButton.innerText = '下一页';
    nextButton.addEventListener('click', function () {
      showPage(currentPage + 1);
    });
    pageButtonsDiv.appendChild(nextButton);
  }
}

// 搜索文章内容
document.getElementById('searchButton').addEventListener('click', function () {
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm === '') {
    return;
  }
  const pages = document.getElementsByClassName('page');
  const searchResultsDiv = document.getElementById('searchResults');
  searchResultsDiv.innerHTML = '';
  let searchCount = 0;

  for (let i = 0; i < pages.length; i++) {
    const pageContent = pages[i].textContent;
    const searchTermIndex = pageContent.indexOf(searchTerm);
    if (searchTermIndex !== -1) {
      const contextBefore = pageContent.substring(Math.max(0, searchTermIndex - 50), searchTermIndex);
      const contextHighlighted = pageContent.substring(searchTermIndex, searchTermIndex + searchTerm.length);
      const contextAfter = pageContent.substring(searchTermIndex + searchTerm.length, searchTermIndex + searchTerm.length + 50);

      const resultDiv = document.createElement('div');
      resultDiv.innerHTML = `${contextBefore}<span class="highlight">${contextHighlighted}</span>${contextAfter}`;
      resultDiv.classList.add('searchResult');
      resultDiv.addEventListener('click', function () {
        showPage(i + 1);
        searchResultsDiv.innerHTML = '';
      });
      searchResultsDiv.appendChild(resultDiv);
      searchCount++;
      // 每次搜索后向下翻动一页
      window.scrollBy({
        top: 600,
        behavior: "smooth",
      });
    }
  }

  if (searchCount === 0) {
    const noResultDiv = document.createElement('div');
    noResultDiv.textContent = '未找到匹配结果。';
    noResultDiv.classList.add('searchResult');
    searchResultsDiv.appendChild(noResultDiv);
  }
});

// 网络搜书
document.getElementById("netsearchButton").addEventListener("click", function () {
  var keyword = document.getElementById("searchInput").value;
  if (keyword.trim() === "") {
    alert("请输入搜索关键词！");
    return;
  }
  var searchUrl = "https://www.bing.com/search?q=" + encodeURIComponent(keyword + "txt下载");
  window.open(searchUrl, "_blank");
});

function initializeSettings() {
  const defaultSettings = {
    backgroundColor: '#f4f4f4',
    fontSize: '16px',
    fontColor: '#000000',
    fontWeight: 'normal',
    lineHeight: '1'
  };

  const settings = {
    backgroundColor: localStorage.getItem('backgroundColor') || defaultSettings.backgroundColor,
    fontSize: localStorage.getItem('fontSize') || defaultSettings.fontSize,
    fontColor: localStorage.getItem('fontColor') || defaultSettings.fontColor,
    fontWeight: localStorage.getItem('fontWeight') || defaultSettings.fontWeight,
    lineHeight: localStorage.getItem('lineHeight') || defaultSettings.lineHeight
  };

  document.body.style.backgroundColor = settings.backgroundColor;
  document.getElementById('backgroundColorSelect').value = settings.backgroundColor;
  document.getElementById('fontSizeInput').value = settings.fontSize.replace('px', '');
  document.getElementById('fontColorSelect').value = settings.fontColor;
  document.getElementById('fontWeightSelect').value = settings.fontWeight;
  document.getElementById('lineHeightInput').value = settings.lineHeight;

  updatePagesStyles(settings);
}

function updatePagesStyles(settings) {
    var style = document.createElement('style');
    style.innerHTML = `
  .page {
         display: none; 
         font-size: ${settings.fontSize};
          font-weight: ${settings.fontWeight};
         color: ${settings.fontColor};
         background-color: ${settings.backgroundColor};
        }
  p {
    line-height: ${settings.lineHeight};
    }
  `;
    document.head.appendChild(style);
}

function updateSetting(key, value) {
  localStorage.setItem(key, value);
  const settings = {
    backgroundColor: localStorage.getItem('backgroundColor'),
    fontSize: localStorage.getItem('fontSize'),
    fontColor: localStorage.getItem('fontColor'),
    fontWeight: localStorage.getItem('fontWeight'),
    lineHeight: localStorage.getItem('lineHeight')
  };
  updatePagesStyles(settings);
}

// 页面加载时初始化设置
window.addEventListener('DOMContentLoaded', initializeSettings);

document.getElementById('backgroundColorSelect').addEventListener('change', function () {
  const newColor = this.value;
  document.body.style.backgroundColor = newColor;
  updateSetting('backgroundColor', newColor);
});

document.getElementById('fontSizeInput').addEventListener('change', function () {
  const newSize = this.value + 'px';
  updateSetting('fontSize', newSize);
});

document.getElementById('fontColorSelect').addEventListener('change', function () {
  const newColor = this.value;
  updateSetting('fontColor', newColor);
});

document.getElementById('fontWeightSelect').addEventListener('change', function () {
  const newWeight = this.value;
  updateSetting('fontWeight', newWeight);
});

document.getElementById('lineHeightInput').addEventListener('change', function () {
  const newHeight = this.value;
  updateSetting('lineHeight', newHeight);
});
