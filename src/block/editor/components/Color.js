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
  const {setAttributes} = useBlockContext();

  return (
    <BaseControl
      label={label}
      help={help}
      __nextHasNoMarginBottom
    >
      <VStack spacing="4" style={{marginTop: 10}}>
        <ColorPalette
          value={value}
          onChange={(color) => setAttributes({[name]: color})}
        />
      </VStack>
    </BaseControl>
  )
}

export default Color;
