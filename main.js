// ==UserScript==
// @name         提取数据脚本(带价格比较和选择性批量打开)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  提取并展示数据，当price1大于price2时标红，批量打开非标红项
// @author       suibianwanwan
// @match        https://dexscreener.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 盈亏比
    const PRICE_RATIO_THRESHOLD = 10;

    // 创建按钮和面板
    var button = document.createElement('button');
    button.textContent = '提取数据';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    var panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '60px';
    panel.style.right = '10px';
    panel.style.zIndex = '1000';
    panel.style.backgroundColor = 'white';
    panel.style.color = 'black';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '5px';
    panel.style.padding = '15px';
    panel.style.maxHeight = '80vh';
    panel.style.overflowY = 'auto';
    panel.style.display = 'none';
    panel.style.width = '800px';
    panel.style.backgroundColor = '#ffffff';
    panel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    document.body.appendChild(button);
    document.body.appendChild(panel);

    // 存储地址和价格比较结果
    var addressesData = [];

    // 解析价格字符串为数值
    function parsePrice(priceStr) {
        if (!priceStr || priceStr === "null") return 0;

        // 移除 $ 符号和逗号
        priceStr = priceStr.replace(/[$,]/g, '');

        // 处理 K/M/B 后缀
        if (priceStr.endsWith('K')) {
            return parseFloat(priceStr.slice(0, -1)) * 1000;
        } else if (priceStr.endsWith('M')) {
            return parseFloat(priceStr.slice(0, -1)) * 1000000;
        } else if (priceStr.endsWith('B')) {
            return parseFloat(priceStr.slice(0, -1)) * 1000000000;
        }

        return parseFloat(priceStr);
    }

    // 批量打开链接的函数
    function batchOpenLinks(urls) {
        const buttons = [];
        urls.forEach(url => {
            const tempButton = document.createElement('a');
            tempButton.href = url;
            tempButton.target = '_blank';
            tempButton.style.display = 'none';
            document.body.appendChild(tempButton);
            buttons.push(tempButton);
        });

        requestAnimationFrame(() => {
            buttons.forEach(button => {
                button.click();
                button.remove();
            });
        });
    }

    // 点击按钮时提取数据
    button.addEventListener('click', function() {
        // 首先点击 Top Traders 按钮
        const topTradersButton = document.querySelector('.chakra-button.custom-165cjlo');
        if (topTradersButton) {
            topTradersButton.click();

            setTimeout(() => {
                panel.innerHTML = '';
                panel.style.display = 'block';
                addressesData = [];

                var elements = document.querySelectorAll('.custom-1mxzest');
                var maxPrintCount = 100;

                if (elements.length > 0) {
                    elements.forEach(function(element) {
                        var innerElements = element.querySelectorAll('.custom-1kikirr');
                        if (innerElements.length > 0) {
                            innerElements.forEach(function(innerElement) {
                                var custom1nvxwu0Elements = Array.from(innerElement.querySelectorAll('.custom-1nvxwu0'));

                                var printCount = 0;
                                custom1nvxwu0Elements.forEach(function(custom1nvxwu0Element) {
                                    if (printCount >= maxPrintCount) return;

                                    var numberElement = custom1nvxwu0Element.querySelector('.custom-1sz5wf8 .chakra-text.custom-q9k0mw');
                                    var price1Element = custom1nvxwu0Element.querySelector('.custom-1o79wax .chakra-text.custom-rcecxm');
                                    var price2Element = custom1nvxwu0Element.querySelector('.custom-1e9y0rl');
                                    var addressElement = custom1nvxwu0Element.querySelector('.custom-1dwgrrr .chakra-link');

                                    var number = numberElement ? numberElement.textContent.trim() : "null";
                                    var price1 = price1Element ? price1Element.textContent.trim() : "null";
                                    var price2 = price2Element ? price2Element.textContent.trim() : "null";
                                    var address = addressElement ? addressElement.href.split('/').pop() : "null";

                                    if (price1 === "null") return;

                                    // 解析并比较价格
                                    var price1Value = parsePrice(price1);
                                    var price2Value = parsePrice(price2);

                                    // 计算价格比率，判断是否达到阈值
                                    var priceRatio = price2Value / price1Value;
                                    var isGoodPrice = priceRatio >= PRICE_RATIO_THRESHOLD;

                                    var addressDiv = document.createElement('div');
                                    addressDiv.style.display = 'flex';
                                    addressDiv.style.justifyContent = 'space-between';
                                    addressDiv.style.alignItems = 'center';
                                    addressDiv.style.marginBottom = '10px';
                                    addressDiv.style.padding = '5px';
                                    addressDiv.style.borderBottom = '1px solid #eee';

                                    var textDiv = document.createElement('div');
                                    // 显示价格比率
                                    textDiv.innerHTML = `<span style="color: ${isGoodPrice ? 'green' : 'black'}">${number} ${price1} ${price2} (${priceRatio.toFixed(2)}x) ${address}</span>`;
                                    textDiv.style.flex = '1';

                                    var buttonDiv = document.createElement('div');
                                    buttonDiv.style.marginLeft = '10px';

                                    var analyzeButton = document.createElement('button');
                                    analyzeButton.textContent = '分析';
                                    analyzeButton.style.padding = '5px 10px';
                                    analyzeButton.style.backgroundColor = '#2196F3';
                                    analyzeButton.style.color = 'white';
                                    analyzeButton.style.border = 'none';
                                    analyzeButton.style.borderRadius = '5px';
                                    analyzeButton.style.cursor = 'pointer';

                                    analyzeButton.addEventListener('click', function() {
                                        if (address !== "null") {
                                            window.open('https://gmgn.ai/sol/address/' + address, '_blank');
                                        }
                                    });

                                    buttonDiv.appendChild(analyzeButton);
                                    addressDiv.appendChild(textDiv);
                                    addressDiv.appendChild(buttonDiv);
                                    panel.appendChild(addressDiv);

                                    if (address !== "null") {
                                        addressesData.push({
                                            address: address,
                                            isGoodPrice: isGoodPrice
                                        });
                                    }
                                    printCount++;
                                });
                            });
                        }
                    });
                }

                // 添加批量打开按钮和计数信息
                var validAddressCount = addressesData.filter(data => data.isGoodPrice).length;

                var batchOpenButton = document.createElement('button');
                batchOpenButton.textContent = `批量打开 (${validAddressCount} 个符合条件的地址)`;
                batchOpenButton.style.margin = '15px 0';
                batchOpenButton.style.padding = '10px 20px';
                batchOpenButton.style.backgroundColor = '#2196F3';
                batchOpenButton.style.color = 'white';
                batchOpenButton.style.border = 'none';
                batchOpenButton.style.borderRadius = '5px';
                batchOpenButton.style.cursor = 'pointer';
                batchOpenButton.style.width = '100%';

                panel.appendChild(batchOpenButton);

                // 点击批量打开按钮时只打开符合条件的项
                batchOpenButton.addEventListener('click', function() {
                    var validAddresses = addressesData
                        .filter(data => data.isGoodPrice)
                        .map(data => 'https://gmgn.ai/sol/address/' + data.address);

                    batchOpenLinks(validAddresses);
                });
            }, 1000);
        }
    });
})();