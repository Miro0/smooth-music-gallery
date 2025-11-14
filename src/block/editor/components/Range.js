import {BaseControl, RangeControl} from "@wordpress/components";
import {useBlockContext} from "../context";

const Range = (
  {
    name,
    value,
    label,
    help,
    min = 1,
    max = 10,
    step = 0.5
  }
) => {
  const {changeAttribute} = useBlockContext();

  return (
    <BaseControl
      label={label}
      help={help}
      __nextHasNoMarginBottom
    >
      <RangeControl
        value={value}
        onChange={(value) => changeAttribute(name, value)}
        min={min}
        max={max}
        step={step}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
    </BaseControl>
  )
}

export default Range;
