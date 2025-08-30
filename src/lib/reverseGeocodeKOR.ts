// 역지오코딩... 헬이라네~, 그래도 성공!!

export async function reverseGeocodeKOR(lat: number, lon: number) {
  const qs = new URLSearchParams({
    request: 'coordsToaddr',       
    coords: `${lon},${lat}`,       
    sourcecrs: 'epsg:4326',
    output: 'json',
    orders: 'roadaddr,addr,admcode,legalcode', 
    lang: 'ko',                   
  });

  const resp = await fetch(`/naver/revgeo?${qs.toString()}`);

  const raw = await resp.text();

  if (!resp.ok) {
    throw new Error(`NAVER ${resp.status} ${raw || '(empty body)'}`);
  }
  if (!raw || !raw.trim()) {
    return { address: '', reason: 'empty' } as const;
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('NAVER: invalid JSON response');
  }

  const results: any[] = data?.results ?? [];

  if (!Array.isArray(results) || results.length === 0) {
    return { address: '', reason: 'no_results', raw: data } as const;
  }

  const pick =
    results.find((r) => r.name === 'roadaddr') ??
    results.find((r) => r.name === 'addr') ??
    results.find((r) => r.name === 'admcode') ??
    results.find((r) => r.name === 'legalcode') ??
    results[0];

  const r = pick?.region ?? {};
  const land = pick?.land ?? {};

  const parts = [
    r.area1?.name, // 시/도
    r.area2?.name, // 시/군/구
    r.area3?.name, // 읍/면/동
    r.area4?.name, // 리
    land.name,     // 도로명/지번 동
  ].filter(Boolean);

  const num = [land.number1, land.number2 ? `-${land.number2}` : '']
    .filter(Boolean)
    .join('');

  const address = [parts.join(' '), num].filter(Boolean).join(' ').trim();

  return { address, reason: 'ok', raw: data } as const;
}