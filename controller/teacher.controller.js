const crawl = require("../crawl/teacher.crawl");
const fs = require('fs');
module.exports.getTeacher = async (req, res, next) => {
  let teacherList = await crawl.getTeacher().catch((err) => {
    console.log(err);
  });
  
  if (teacherList) {
    let obj = {
      length: teacherList.length,
       data:teacherList
    }
      let json = JSON.stringify(obj);
      fs.writeFile('data.json',json,(err)=>{
          if(err)
           console.log(err);
          else console.log('saved');
      });
    console.log('done');
    console.log('array length: ' +teacherList.length );
    res.status(200).json({
      success:true,
      message: teacherList
    });  
  } else {
    res.status(500).json({
      success: false,
      message: "Unknown Error",
    });
  }
};
