# language.js
Simple client-side JS translation library based on data attributes

## Basic usage

Add `data-xx="..."` attributes to any HTML element to provide translation
data for it, where `xx` is an **ISO 639-1 code** of the language.

For example: `<span data-cs="Ahoj" data-en="Hi" data-se="Hej"></span>`.
Also add your intended language codes to the `siteLanguages` array.

Then use `switchLanguage(xx)` to swap out all translatable elements'
innerHTMLs to whatever is in the `data-xx` attribute. If no language is
provided (`switchLanguage()`) and there are only two `siteLanguages`,
it switches to the other language.

If `enableSaving` is `true`, calling this function will also save the
newly selected language to `localStorage`.

## Events

Switching the language (including language detection at the start)
triggers a `languageSwitched` event, along with the new language code
saved under the `detail` key of the event. You can access it like so:
`window.addEventListener("languageSwitched", e => console.log(e.detail) )`

## Noun number counts

You can also set `data-numvalue` to a number string, and then optionally
provide declensions in `data-xx` separated by `;` (configurable in the
variable `pluralizeSep`) in the following order: `singular;dual;plural`.

For example: `<span data-numvalue="5" data-cs="dům;domy;domů"></span>`

You can specify 1 - 3 declensions, the unspecified ones will be generated
like so: `dual=singular+"s"`, `plural=dual`. This is meant to make English
nouns straightforward to define, only having to provide `singular`.

This isn't dynamic - changing `data-numvalue` won't automatically replace
the text inside the element accordingly, but it gets updated every time you
switch the language. You can also use `switchLanguage(currentLang, true)`
to only prompt a number noun update. The function's second parameter (called 
`numberUpdateOnly`) is set to `false` by default (if unspecified), and
`currentLang` is a variable that this script exposes globally, containing
the latest used language code.

## Language detection and language aliases

If a saved language isn't foung in `localStorage`, then upon loading the
page, the script will look at the info provided by the browser to determine
if the user's language preferences (`userLangs`) align with the website's
supported languages (`siteLanguages`), and if it does, it switches to that
language automatically.

In supported browsers, `userLangs` can have multiple values ordered by
preference (highest first), so if `userLangs` and `siteLanguages` intersect
in multiple languages, the earliest language in `userLangs` is used.

This check also supports language aliases, for the cases where there are two
similar sounding languages (like `cs` and `sk`), and supporting just one of
of the similar languages (`cs`) is preferable to `sk` seeing `en` content.
For this example, `cs` would have the alias `["sk"]` in `languageAliases`.

## Supporting other language codes and locales

If your `siteLanguages` don't directly translate to ISO 639-1 codes,
for example when you want to implement both American and British English,
or just want to use your own language codes for other reasons, then the
translation functionality itself should work just fine, but you might have
to edit the language detection source code if still you want to support it.
A good place to start with the changes would be `lang.includes(code))`.
