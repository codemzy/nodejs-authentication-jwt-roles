
// numerical encoding of some special characters
exports.cleanStr = function(s) {
    s = s.replace(/&#/g,"##AMPHASH##"); // to prevent double encoding problems so can pass str through multiple times
    s = s.replace(/& /g,"&#38;");
	s = s.replace(/\'/g,"&#39;");
	s = s.replace(/\"/g,"&#34;");
	s = s.replace(/</g,"&#60;");
	s = s.replace(/>/g,"&#62;");
    s = s.replace(/##AMPHASH##/g,"&#");
    return s;
};

// basic email format validation
exports.validateEmail = function(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};
