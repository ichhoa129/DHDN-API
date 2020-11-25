require("dotenv").config();
const puppeteer = require("puppeteer");

async function crawlTeacher() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // headless: false,
  });

  const page = await browser.newPage();
  const webCheck = await page.goto(process.env.WEBCHECK, { waitUntil: "load" });
  if (webCheck._status < 200 || webCheck._status >= 300) return false;

  let loop = true;
  let index = 1;
  let LIST = [];

  while (loop) {
    console.log(index);
    let newi = index.toString();
    const response = await page.goto(process.env.WEBLINK.toString() + newi, {
      waitUntil: "load",
    });

    if (response._status < 200 || response._status >= 300) loop = false;

    await page.waitForSelector(
      "#Thu table span[style='background-color: #008080']"
    );

    const pageList = await page.evaluate(() => {
      let pagiNode = document.querySelector(
        "#Thu table span[style='background-color: #008080']"
      );
      let currentPage = parseInt(pagiNode.textContent);
      let SplitedPage = window.location.href.split("/");
      let pageIndex = parseInt(SplitedPage[SplitedPage.length - 1]);
      if (currentPage != pageIndex) {
        return false;
      }
      let list = [];
      let div = document.getElementById("Thu");
      let table = div.firstChild;
      let trList = table.firstChild.children;
      for (let row of trList) {
        let rowChild = row.children;
        for (let teacher of rowChild) {
          if (teacher.children[0] && teacher.textContent != "") {
            let avatar = teacher.querySelector("img").getAttribute("src");
            let detailLink = teacher.querySelector("b a").href;
            list.push({ avatar: avatar,link: detailLink });
          }
        }
      }
      return list;
    });

    if (!pageList) loop = false;
    else {
      LIST = [...LIST, ...pageList];
      ++index;
    }
  }
  let RESULT = [];
  for (let teacher of LIST) {
    const linkRes = await page.goto(teacher.link, {
      waitUntil: "load",
    });
    if(page.url().indexOf("http://scv.udn.vn")==-1) continue;
    console.log(page.url());
    console.log(linkRes._status);
    if (linkRes._status < 200 || linkRes._status >= 300) continue;
    await page.waitForSelector(
      "#g7vnContent"
    );
    let detail = await page.evaluate(() => {
      let content = document
        .getElementById("g7vnContent")
        .querySelector("tbody").children[4];
      let subContent = content.querySelector("tbody").children;
      let obj = {};
      for (let element of subContent) {
        let title = element.children[0].textContent;
        if (title.indexOf("Họ và tên:") >= 0)
          obj.name = element.children[1].textContent;
        else if (title.indexOf("Giới tính") >= 0)
          obj.gender = element.children[1].textContent;
        else if (title.indexOf("Năm sinh") >= 0)
          obj.birthday = element.children[1].textContent;
        else if (title.indexOf("Nơi sinh") >= 0)
          obj.birthPlace = element.children[1].textContent;
        else if (title.indexOf("Quê quán") >= 0)
          obj.hometown = element.children[1].textContent;
        else if (title.indexOf("Tốt nghiệp ĐH chuyên ngành") >= 0)
          obj.major = element.children[1].textContent;
        else if (title.indexOf("Đơn vị công tác") >= 0)
          {
            let workAt = element.children[1].textContent.split(';');
             obj.faculty = workAt[0];
            obj.university = workAt[1];
          }
        else if(title.indexOf("Chức vụ") >= 0)
           obj.position = element.children[1].textContent;
        else if (title.indexOf("Học vị") >= 0)
          obj.degree = element.children[1].textContent;
        else if (title.indexOf("Dạy CN") >= 0)
          obj.teach = element.children[1].textContent;
        else if (title.indexOf("Lĩnh vực NC") >= 0)
          obj.research = element.children[1].textContent;
        else if (title.indexOf("Ngoại ngữ") >= 0)
          obj.language = element.children[1].textContent;
        else if (title.indexOf("Địa chỉ liên hệ") >= 0)
          obj.contactAdress = element.children[1].textContent;
      }
      return obj;
    });
    console.log(detail);
    RESULT.push({avatar:teacher.avatar,link:teacher.link,faculty:detail.faculty||'',university:detail.university||'',name:detail.name||'',detail:detail});
  }
  await browser.close();
  return RESULT;
}

module.exports.getTeacher = async () => {
  let result = await crawlTeacher();
  console.log('result');
  console.log(result);
  if (result) return result;
  else return "error";
};
