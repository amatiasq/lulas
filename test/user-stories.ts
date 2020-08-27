requireAll((require as any).context('../user-stories/', true, /\.ts$/));

function requireAll(r: any) {
  r.keys().forEach(r);
}
