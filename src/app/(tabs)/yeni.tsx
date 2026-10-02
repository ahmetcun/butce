import { Redirect } from 'expo-router';

/** Ortadaki "+" sekmesi doğrudan /ekle ekranını açar; bu sayfa görünmez. */
export default function New() {
  return <Redirect href="/ekle" />;
}
