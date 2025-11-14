import {BaseControl, ComboboxControl} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {useBlockContext} from "../context";

const capitalizeWords = str => str.replace(/\b\w/g, c => c.toUpperCase()).replace('3d', '3D');

const Select = (
  {
    name,
    value,
    options = [],
    label,
    placeholder,
    help,
  }
) => {
  const {changeAttribute} = useBlockContext();

  return (
    <BaseControl
      label={label}
      help={help}
      __nextHasNoMarginBottom
    >
      <ComboboxControl
        value={value}
        options={options.map((item) => {
          const formattedTheme = capitalizeWords(item.replace(/_/g, ' '));

          return {
            label: __(formattedTheme, 'wpmusicgallery'),
            value: item,
          }
        })}
        onChange={(value) => changeAttribute(name, value)}
        placeholder={placeholder}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
    </BaseControl>
  )
}

export default Select;
