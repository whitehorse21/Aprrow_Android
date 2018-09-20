## 3.2.0
  - Fix issue 96 type annotations with member expressions #98

## 3.1.3
  - Fix error on attempted propTypes generation for non-component function (#66)

## 3.1.2
  -  Fix bug with functions defaulting to react components (#97)

## 3.1.0

  - Add support for top-level propTypes assignment of imported types (#88)
  - Add support for instanceOf (see PR #6, #92)
  - Fix isRequired for imported types (if they are not functions)

## 3.0.0

 - Fix #75: intersection not supported
 - Fix #71: propTypes are not created if you assign props from a pre-defined
   type or if you import types from another file
 - Testcase for #1, known working
 - Testcase for #19, known working

## 2.2.1


## 2.2.0

 - Merge pull request #83 from mehcode/ignore-opt
 - Enforce linting (#82)

## 2.1.3


## 2.1.2

 - Update remaining react PropTypes (#81)

## 2.1.1


## 2.1.0

 - Suppress transform of any file in node_modules (#79)

## 2.0.0

 - allow imports from non-local packages, #62
 - Fix typo in readme "onw_of_type" -> "one_of_type" (#77)

## 1.2.0

 - Fix hoc (#76)

## 1.1.0

 - handles intersection types, #75

## 1.0.0

 - uses prop-types package, fixes #72

## 0.21.0

 - supports existential types, fixes #68

## 0.20.0

 - ensure 'exports' is defined before setting type exports, fixes #65

## 0.19.0

 - ignore imports from non-relative paths, fixes #62

## 0.18.2

 - Properly handle exporting named types (#60)
 - Added dependency status repo badge (#59)

## 0.18.1


## 0.18.0

 - Use package.json files field (#58)

## 0.17.2


## 0.17.1


## 0.17.0

 - supports () : ReactElement =>, fixes #55

## 0.16.0

 - traverse function contents looking for jsx, fixes #54

## 0.15.0


## 0.14.1


## 0.14.0

 - add support for exact types (#51)

## 0.13.3


## 0.13.2


## 0.13.1


## 0.13.0

 - adds suppression directive, #9

## 0.12.2


## 0.12.1

 - Add support for `mixed` (#46)

## 0.12.0

 - handles GenericTypeAnnotation in getPropsForTypeAnnotation, fixes #42

## 0.11.0


## 0.10.2

 - Fixed crash when props are annotated as Object (#41)

## 0.10.1

 - use any for IntersectionTypeAnnotation, fixes #40

## 0.10.0

 - Merge pull request #39 from laat/stateless-arrow-body

## 0.9.6

 - Merge pull request #38 from skovhus/export-declartion-fix

## 0.9.5


## 0.9.4

 - Merge pull request #37 from skovhus/props-inline-in-class
 - Reuse typeannotation logic to fix bug with inline props (solves #35)
 - Merge pull request #36 from skovhus/travis-integration

## 0.9.3


## 0.9.2

 - Merge pull request #34 from skovhus/TupleTypeAnnotation
 - Merge pull request #33 from skovhus/support-union-with-null

## 0.9.1

 - Merge pull request #32 from skovhus/bug-fixes

## 0.9.0

 - Merge pull request #31 from skovhus/functional-components
 - Stop relying on type definition name ending with Props (solves #9)
 - Merge pull request #30 from skovhus/eslint

## 0.8.0

 - Merge pull request #27 from SomeHats/master

## 0.7.4

 - handles TypeofTypeAnnotation, fixes #25

## 0.7.3

 - handles StringLiteralTypeAnnotation and similar, fixes #24

## 0.7.2

 - handles ImportDefaultSpecifier, fixes #23

## 0.7.1

 - defaults import to PropTypes.any if it doesn't exist, #2

## 0.7.0

 - adds hacking.md, resolves #20

## 0.6.0

 - support string[], etc. fixes #17

## 0.5.2

 - fixes insertAfter with named exports and top level class declarations, fixes #16

## 0.5.1

 - fixes export type top level shape to use require('react'), #14

## 0.5.0

 - use require('react') instead of React, fixes #14

## 0.4.6

 - supports NullableTypeAnnotation, fixes #15

## 0.4.5


## 0.4.4


## 0.4.3


## 0.4.1

 - Merge pull request #10 from STRML/cleanup

## 0.4.0

 - Merge pull request #8 from STRML/void

## 0.3.2


## 0.3.1

 - fixes handling of ExportNamedDeclaration for non-TypeAlias, fixes #7

## 0.3.0


## 0.2.6


## 0.2.5


## 0.2.4


## 0.2.3


## 0.2.2


## 0.2.1


## 0.2.0


## 0.1.6


## 0.1.5


## 0.1.4


## 0.1.3


## 0.1.2


## 0.1.1

