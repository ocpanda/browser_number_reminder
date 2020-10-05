# Slack 瀏覽器版本通知機器人

## 服務位置
>web api -> http://10.36.3.100:30096/
>
>k8s lego 開發 -> browser-number-reminder-deployment

## 部屬方式
### 開發版

> 為避免爬蟲次數過多被目標網站黑名單，不會進行爬蟲，使用test資料夾內的測試資料進行功能測試。

1. server.js第四行 `global.STAGE` 賦值為 `DEV`
2. tag格式 *--dev
3. 將tag推上gitlab會開始編譯image
4. 將image的tag放上k8s的`	browser-number-reminder-deployment`(lego開發內)

### 正式版
> 注意使用正式版時不要主動戳api。

1. server.js第四行 `global.STAGE` 賦值為 `PROD`
2. tag格式 *--prod
3. 將tag推上gitlab會開始編譯image
4. 將image的tag放上k8s的`	browser-number-reminder-deployment`(lego開發內)

## 軟體架構
#### 進入點
- server.js
    - 開啟api server，設定目前模式(開發/正式)

#### 軟體功能
- app/bot/index.js
    - 瀏覽器版本爬蟲
- app/scanner/index.js
    - 資料回補
- database/store.js
    - 檔案讀寫

#### 共用函式
- helpler/index.js

#### 測試資料
- test/testData.js
    - 測試資料檔

#### 排程檔
- crontab.txt
    - 排程設定檔
    
#### Shell檔
- bot.sh / scanner.sh
    - 分別執行爬蟲及資料回補api