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
  const formatOptions = options.map((item) => {
    if (typeof item === 'object' && item?.value) {
      return {
        label: item.label,
        value: item.value,
      };
    }

    const formattedTheme = capitalizeWords(item.replace(/_/g, ' '));

    return {
      label: __(formattedTheme, 'smooth-music-gallery'),
      value: item,
    }
  });

  return (
    <BaseControl
      label={label}
      help={help}
      __nextHasNoMarginBottom
    >
      <ComboboxControl
        value={value}
        options={formatOptions}
        onChange={(value) => changeAttribute(name, value)}
        placeholder={placeholder}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
    </BaseControl>
  )
}

export default Select;
