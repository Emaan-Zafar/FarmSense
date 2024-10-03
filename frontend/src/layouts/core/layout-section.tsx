import type { Theme, SxProps, CSSObject } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';

import { baseVars } from 'src/components/navbar/config-vars';
import { layoutClasses } from '../classes';

// ----------------------------------------------------------------------

export type LayoutSectionProps = {
  sx?: SxProps<Theme>;
  cssVars?: CSSObject;
  children?: React.ReactNode;
  footerSection?: React.ReactNode;
  headerSection?: React.ReactNode;
  sidebarSection?: React.ReactNode;
};

export function LayoutSection({
  sx,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
}: LayoutSectionProps) {
  const theme = useTheme();

  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        body: {
          ...baseVars(theme),
          ...cssVars,
        },
      }}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <Box id="root__layout" className={layoutClasses.root} sx={sx}>
        {sidebarSection}
        <Box
          display="flex"
          flex="1 1 auto"
          flexDirection="column"
          className={layoutClasses.hasSidebar}
        >
          <Box
            sx={{
              backgroundColor: 'transparent', // Set the header's background to transparent
              boxShadow: theme.shadows[1], // Optional: add a shadow for distinction
              zIndex: theme.zIndex.appBar, // Ensure it stays on top
            }}
          >
            {headerSection}
          </Box>
          {children}
          {footerSection}
        </Box>
      </Box>
    </>
  );
}
