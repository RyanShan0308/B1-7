//門診時間
// const HOURS = [
//     {day:1,name:"星期一",am:true,pm:true,night:false},
//     {day:2,name:"星期二",am:true,pm:true,night:false},
//     {day:3,name:"星期三",am:true,pm:false,night:true},
//     {day:4,name:"星期四",am:true,pm:true,night:false},
//     {day:5,name:"星期五",am:false,pm:false,night:false},
//     {day:6,name:"星期六",am:false,pm:false,night:false}
// ];
let HOURS = [];

//先拿到畫面上會動元素
const hoursBody = document.getElementById("hoursBody");
const todayBox = document.getElementById("today");
const form = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const moreButton = document.getElementById("moreButton");
const moreInfo = document.getElementById("moreInfo");
const fhirButton = document.getElementById("fhirButton");
const fhirInfo = document.getElementById("fhirInfo");

//讀取門診時間
async function loadHours() {
    try{
        const res = await fetch("data/hours.json");
        if(!res.ok){
            throw new Error("HTTP" + res.status);
        }
        HOURS = await res.json();
        renderHours();
        showToday();
    }catch(error){
        hoursBody.innerHTML = '<tr><td class="text-danger">門診時間載入失敗' + error.message + "</td></tr>";
        todayBox.textContent = "門診時間載入失敗"
    }
}

// 讀取FHIR伺服器資料
fhirButton.addEventListener("click",async function(){
    fhirInfo.textContent="問問看...";
    try{
        const res = await fetch("https://hapi.fhir.org/baseR4/metadata");
        if(!res.ok){
            throw new Error("HTTP"+res.status);
        }
        const metadata = await res.json();
        fhirInfo.textContent="伺服器名稱/FHIR版本:" + metadata.software.name + "," + metadata.fhirVersion;
    }
    catch(error){
        fhirInfo.textContent = "有問題：" + error.message;
    }
});


//一格：看診休診
function cell(open){
    if(open)
        return "<td>看診</td>"; //if內容若只有一行不需要{}
    else
        return '<td class="text-muted">休診</td>';
}

//把HOUR畫成表格
function renderHours(){
    let html = "";
    for(const h of HOURS){
        html += "<tr><th>" + h.name + "</th>" + cell(h.am) + cell(h.pm) + cell(h.night) + "</tr>"
    }
    hoursBody.innerHTML = html;
}

//今天有無看診
function showToday(){
    const d = new Date().getDay();
    let today = null;
    for(const h of HOURS){
        if(h.day === d){
            today = h;
        }
    }
    if(!today){
        todayBox.textContent = "今天(星期日)休診"
        return;
    }
    if (today.am === false && today.pm === false && today.night === false) {
        todayBox.textContent = "今天(" + today.name + ")休診";
        return;
    }

    const open = [];
    if(today.am) open.push("上午");
    if(today.pm) open.push("下午");
    if(today.night) open.push("晚上");
    todayBox.textContent = "今天(" + today.name + ")看診時段: " + open.join("/");
}

// 表單送出
form.addEventListener("submit",function(event){
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    if(name === ""){
        formMessage.textContent = "請輸入姓名";
        return;
    }
    if(!/^[0-9]{8,10}$/.test(phone)){
        formMessage.textContent = "請輸入正確的電話號碼 8到10碼";
        return;
    }
    formMessage.textContent = "送出成功，謝謝！" + name + " ,我們會盡快與您聯絡"
    form.reset();
});

//看更多按鈕
moreButton.addEventListener("click",function(){
    moreInfo.classList.toggle("d-none");
});

// renderHours();
// showToday();
loadHours();