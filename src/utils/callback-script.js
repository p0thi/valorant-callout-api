console.log("Baum");
window.onload=function (){
  const urlParams=new URLSearchParams(window.location.search);
  if (window.opener){
    let code=urlParams.get("code");
    console.log(code);
    window.opener.postMessage({code, source: "callback"}, "*");
    window.close();
  }
};
