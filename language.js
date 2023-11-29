// Config

/** @typedef {string} supportedLang */
/** @enum {supportedLang} */
const siteLanguages = ["en", "cs"]
const languageAliases = {"cs": ["cz", "sk", "hsb", "dsb", "szl"]}
let enableSaving = true
let pluralizeSep = ";"

// Utility one-liners

/** @returns {number} */
function now() { return new Date().getTime() }

/** @param {String} query @returns {HTMLElement?} */
function $(query) { return document.querySelector(query) }

/** @param {String} query @returns {NodeListOf<HTMLElement>} */
function $all(query) { return document.querySelectorAll(query) }

/** @param {String} id @returns {HTMLElement?} */
function id(id) { return document.getElementById(id) }

/** @param {object} obj @returns {object} */
function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)) }

// Var setup

let currentLang = ""
let preventSaving = true

const stats = {
  toggleLang: -1,
  toggleTheme: 0
}


// On load function
window.addEventListener("load", () => {

  // Load previously saved language
  const savedLang = localStorage.getItem("languagePreference")
  if (!!savedLang && siteLanguages.includes(savedLang))
  currentLang = savedLang
  
  // Detect preferred language
  else currentLang = detectLanguage()[0][0].toString()

  // Set up localization (l10n)
  switchLanguage(currentLang, false, false)
  if (enableSaving) preventSaving = false
})

function detectLanguage() {
  const numToInfinity = (/** @type {number} */ number, /** @type {number} */ test) => number == test ? Infinity : number
  const userLangs = navigator.languages ?? [navigator.language ?? navigator.userLanguage ?? ""]
  const userLangPreference = siteLanguages
    .map(code => [code, (
      (userLangs.findIndex(lang => lang.includes(code)) + 1) || (
        code in languageAliases
          ? Math.min(...languageAliases[code]?.map( (/** @type {string} */ alt) =>
            1 + numToInfinity(userLangs.findIndex(lang => lang.includes(alt)), -1) ))
          : 0
      )) - 1
    ]
    ).sort((a, b) => numToInfinity(a[1], -1) - numToInfinity(b[1], -1))
  /* const userLangPreference = userLangs.filter(lang => siteLanguages.some(slang => lang.includes(slang))) */
  console.group("Language detection")
  console.debug("Site supported", siteLanguages, languageAliases)
  console.debug("User preferred", userLangs)
  console.debug("Matched compromise", userLangPreference.flat(), userLangPreference[0][0])
  console.groupEnd()
  return userLangPreference
}

/** @param {supportedLang} [toLang] */
function switchLanguage(toLang, numberUpdateOnly=false, verbose=true) {
  const toggleMessageLimit = 6

  /** @type {supportedLang|string} */
  const lang = (toLang)
  ?? (numberUpdateOnly ? currentLang
  : (siteLanguages.length == 2 ? siteLanguages.find(L => L != currentLang) : null))

  if (lang == null) {
      console.error(`Please specify a language from:`, siteLanguages)
      return -1
  }

  if (!siteLanguages.includes(lang)) {
      console.error(`Unknown language ${lang}, try:`, siteLanguages)
      return -1
  }

  let count = 0
  let success = []
  let errors = []

  if (!numberUpdateOnly && verbose) {
      if (stats.toggleLang >= toggleMessageLimit) 
          console.debug("Translate: Switching languages")
      else
          console.debug("Translate: Switching to", lang)
  }

  const query = siteLanguages.map(lang => `[data-${lang}]`).join(",")
  const translatable = $all(query)

  translatable.forEach(el => {
      try {
          if (!el.dataset[lang])
              throw new ReferenceError(`Missing translation string for language ${lang} on ${el}`)
          if (el.dataset.numvalue) {
              const number = Number(el.dataset.numvalue)
              if (isNaN(number)) throw new TypeError(`Non-numerical value attribute in ${el}`)
              el.innerHTML = pluralize(el.dataset.numvalue, ...(el.dataset[lang].split(";")))
          } else if (!numberUpdateOnly) {
              el.innerHTML = el.dataset[lang] || ""
          }
          count++
          success.push(el)
      } catch (error) {
          console.error(error)
          errors.push(el)
      }
  })

  currentLang = lang
  if (!numberUpdateOnly) {
      stats.toggleLang++
      if (verbose && stats.toggleLang <= toggleMessageLimit || errors.length != 0)
      console.debug("Translated", count, "/", translatable.length, "elements")

      if (verbose && stats?.toggleLang == toggleMessageLimit)
      console.warn("You're changing the language a lot, the console output will be truncated from now on.")
  }

  if (preventSaving == false) {
    localStorage.setItem("languagePreference", currentLang)
  }

  window.dispatchEvent(new CustomEvent("languageSwitched", { detail: lang }))

  return { currentLang, success, errors, count, expected: translatable.length }
}

/** @param {string} singular @param {string} number */
function pluralize(number, singular, dual=singular+"s", plural=dual, includeNumber=true) {
function _(string) { return includeNumber ? `${number} ${string}` : string }
function a(number) { return Math.abs(number) }
return a(number) == 1
    ? _(singular)
    : 2 <= a(number) && a(number) <= 4 ? _(dual) : _(plural)
}
