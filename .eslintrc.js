module.exports = {
  "ecmaVersion": 5,
  "sourceType": "module",
  "impliedStrict": true,
  "ecmaFeatures":{},
  "env":{
    "browser": true
  },
  "extends":"eslint:recommended",
  rules:{
    semi: [2, "always"],
    indent: ["error"]
  },
  globals:{
    require: false,
    module: false
  }
};
