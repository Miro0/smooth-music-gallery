import {__experimentalVStack as VStack, BaseControl} from "@wordpress/components";
import {useBlockContext} from "../context";
import {ColorPalette} from "@wordpress/block-editor";

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
      <VStack spacing="4" style={{marginTop: 10}}>
        <ColorPalette
          clearable={false}
          value={value}
          onChange={(color) => changeAttribute(name, color)}
        />
      </VStack>
    </BaseControl>
  )
}

export default Color;
