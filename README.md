# React hook form - use field array issue reproduction

This Repo is meant to provide a reproduction for an edge case issue with the useFieldArray. It's a very basic repository
that was created with Vite using a react typescript template.

The prerequisites to reproduce the issue:
- UseFieldArray with a validation rule
- At least one item already inserted that contains a checkbox
- insert at a position before an item already inserted

Explanation of the root cause:
- When you insert a new item that contains a checkbox before another item, the checkbox will be created as a checkbox group
```
                else if (fieldReference.refs) {
                    if (isCheckBoxInput(fieldReference.ref)) {
                        fieldReference.refs.length > 1
                            ? fieldReference.refs.forEach((checkboxRef) => (!checkboxRef.defaultChecked || !checkboxRef.disabled) &&
                                (checkboxRef.checked = Array.isArray(fieldValue)
                                    ? !!fieldValue.find((data) => data === checkboxRef.value)
                                    : fieldValue === checkboxRef.value))
                            : fieldReference.refs[0] &&
                                (fieldReference.refs[0].checked = !!fieldValue);
                    }
                    ...
                }
```
- The library checks is `fieldReference.refs.length > 1` to determine if the control is a checkbox group or a single checkbox. In reality it's a single checkbox but it's recognized as a group
because the are more than one refs, the one at the position inserted and the one after. In other words the `refs` is not computed properly.
- The reason why there is more than 1 ref comes from the `_setFieldArray`, inserting the new item doesn't work as expected
```
      if (shouldUpdateFieldsAndState && Array.isArray(get(_fields, name))) {
        const fieldValues = method(get(_fields, name), args.argA, args.argB);
        shouldSetValues && set(_fields, name, fieldValues);
      }
```
Normally, `Array.isArray(get(_fields, name))` should return true because it's a field array. However, this returns false. When there is a validation
on the useFieldArray, the field is actually an object like so:
```
{
  0: item1,
  1: item2,
  _f: reference to the element
}
```
When there is no validation on the useFieldArray `Array.isArray(get(_fields, name))` returns true because the value is:
```
[
  item1,
  item2
]
```
- Because of that, what happens is the new item gets appended at the end, when the `register` for the new element is triggered, it registers the wrong element, it register
the element that is at the insert position, but it was already registered and has a ref. Now this item has 2 refs and causes the UI to reflect the wrong state and it behaves like a checkbox group.

