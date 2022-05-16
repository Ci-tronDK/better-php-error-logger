# Change Log


## [Change Log]
Version 0.061 16/5 2022 21.42 CEST
- Uses <br> for new line instead of \n when useEchoInstead is set to true.

Version 0.060 16/5 2022 20.07 CEST
- Fixed so it uses replaceAll instead of 2 times replace. Changed print call stack to one line. Added setting to also var_dump variable. Added another setting to echo instead of error_log. Changed the default error logs. Changed description to say it the extension is customisable.

Version 0.054, 7/5 2022 11.25 CEST
- Added changelogs for other versions and corrected mistake where it said version 0.052 instead of 0.053. Made line number in parantheses as default and changed description to reflect the change.

Version 0.053, 4/5 2022 16.50 CEST
- Added \ to new Exception when printing call stack. And added newline after printing call stack. Added changelog for version 0.053.

Version 0.052, 3/5 2022 19.38 CEST
- Made so it replaces all ${selectedVar} with the selected variable instead of only the first one.

Version 0.051, 3/5 2022 19.11 CEST
- Made so if you select an array with key, it will always use "" instead of '' for the key, so it works when printing out the variable name.

Version 0.05, 3/5 2022 18.55 CEST
- Added settings so you can choose how you error logs look like and choose to also print call stack, added explanation to description.

Version 0.02, 3/5 2022 16.44 CEST
- Removed space before printing line number in error log.

Version 0.01, 2/5 2022 18.02 CEST
- Initial release  