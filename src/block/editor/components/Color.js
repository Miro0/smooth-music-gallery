import {BaseControl, ColorPicker} from "@wordpress/components";
import {useBlockContext} from "../context";

const Color = (
  {
    name,
    value,
    label,
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
      <div style={{marginTop: 10}}>
        <ColorPicker
          color={value}
          onChangeComplete={(color) => changeAttribute(name, color.hex)}
          disableAlpha={false}
        />
      </div>
    </BaseControl>
  );
};

export default Color;
