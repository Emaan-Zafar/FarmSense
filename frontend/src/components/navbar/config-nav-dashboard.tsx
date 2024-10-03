import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Cow Catalog',
    path: '/dashboard/catalog',
    icon: icon('ic-catalog'),
  },
  {
    title: 'Disease Detection',
    path: '/dashboard/disease_detection',
    icon: icon('ic-disease'),
  },
  {
    title: 'Behaviour Analysis',
    path: '/dashboard/behaviour_analysis',
    icon: icon('ic-behaviour'),
  },
  {
    title: 'Sign in',
    path: '/sign-in',
    icon: icon('ic-lock'),
  },
];
