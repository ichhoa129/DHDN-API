require("dotenv").config();
const puppeteer = require("puppeteer");


async function crawlTeacher() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
      console.log(currentPage != pageIndex);
      let list = [];
      let div = document.getElementById("Thu");
      let table = div.firstChild;
      let trList = table.firstChild.children;
      for (let row of trList) {
        let rowChild = row.children;
        for (let teacher of rowChild) {
          if(teacher.children[0] && teacher.textContent!='')
          {
              let avatar = teacher.querySelector("img").getAttribute("src");
              let name = teacher.querySelector("b a").textContent;
              let prop = teacher
                .querySelector("tbody")
                .children[1].querySelector("td").children[1].innerText.split('\n');
              let major = prop[1];
              let workPlace = prop[2];
              list.push({avatar:avatar,name:name,major:major,workPlace:workPlace});
          }
        }
      }
      return list;
    });
    
    if (!pageList) loop = false;
    else
    {
        LIST = [...LIST,...pageList];
        ++index;
    }
  }
  await browser.close();
  return LIST;
}

module.exports.getTeacher = async () => {
  let result = await crawlTeacher();
 if(result)
     return result;
 else return 'error';
};
