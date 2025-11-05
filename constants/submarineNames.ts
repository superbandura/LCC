/**
 * Submarine Names Database
 *
 * Real submarine names for USMC and PLAN forces.
 * These names are randomly assigned when deploying submarine cards to the submarine campaign.
 */

export const SUBMARINE_NAMES = {
  us: [
    'USS Virginia (SSN-774)',
    'USS Texas (SSN-775)',
    'USS Hawaii (SSN-776)',
    'USS North Carolina (SSN-777)',
    'USS New Hampshire (SSN-778)',
    'USS New Mexico (SSN-779)',
    'USS Missouri (SSN-780)',
    'USS California (SSN-781)',
    'USS Mississippi (SSN-782)',
    'USS Minnesota (SSN-783)',
    'USS North Dakota (SSN-784)',
    'USS John Warner (SSN-785)',
    'USS Illinois (SSN-786)',
    'USS Washington (SSN-787)',
    'USS Colorado (SSN-788)',
    'USS Ohio (SSGN-726)',
    'USS Michigan (SSGN-727)',
    'USS Florida (SSGN-728)',
    'USS Georgia (SSGN-729)',
    'USS Seawolf (SSN-21)'
  ],
  china: [
    '长征3号 (Changzheng-3)',
    '长征4号 (Changzheng-4)',
    '长征5号 (Changzheng-5)',
    '长征6号 (Changzheng-6)',
    '长征7号 (Changzheng-7)',
    '长征8号 (Changzheng-8)',
    '长征9号 (Changzheng-9)',
    '长征10号 (Changzheng-10)',
    '长征11号 (Changzheng-11)',
    '长征12号 (Changzheng-12)',
    '长征13号 (Changzheng-13)',
    '长征14号 (Changzheng-14)',
    '长城330号 (Changcheng-330)',
    '长城331号 (Changcheng-331)',
    '长城332号 (Changcheng-332)',
    '长城333号 (Changcheng-333)',
    '潜龙1号 (Qianlong-1)',
    '潜龙2号 (Qianlong-2)',
    '潜龙3号 (Qianlong-3)',
    '潜龙4号 (Qianlong-4)'
  ]
};

/**
 * Assigns a random submarine name from the available pool
 * @param faction - 'us' or 'china'
 * @param usedNames - Array of already used names
 * @returns Random submarine name
 */
export function assignRandomSubmarineName(
  faction: 'us' | 'china',
  usedNames: string[]
): string {
  const availableNames = SUBMARINE_NAMES[faction].filter(
    name => !usedNames.includes(name)
  );

  if (availableNames.length === 0) {
    // If all names are used, reuse with suffix
    const baseName = SUBMARINE_NAMES[faction][0];
    const suffix = Math.floor(usedNames.length / SUBMARINE_NAMES[faction].length) + 1;
    return `${baseName} ${suffix > 1 ? 'I'.repeat(suffix) : 'II'}`;
  }

  const randomIndex = Math.floor(Math.random() * availableNames.length);
  return availableNames[randomIndex];
}
