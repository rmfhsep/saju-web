const { withDangerousMod, withPodfileProperties } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * React Native Firebase 공식 문서: use_frameworks! :linkage => :static 조합에서
 * RNFirebase가 정상적으로 컴파일/링크되려면 Podfile에 $RNFirebaseAsStaticFramework = true
 * 전역 변수가 먼저 선언되어 있어야 한다. (없으면 런치 시점에 dyld SIGABRT 크래시)
 * expo-build-properties에는 이 옵션이 없어서 별도 플러그인으로 Podfile 맨 위에 주입한다.
 */
function withFirebaseStaticFramework(config) {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');
      const marker = '$RNFirebaseAsStaticFramework = true';
      if (!contents.includes(marker)) {
        contents = `${marker}\n${contents}`;
        fs.writeFileSync(podfilePath, contents);
      }
      return config;
    },
  ]);
}

/**
 * Podfile.properties.json 경유로는 EXPO_USE_PRECOMPILED_MODULES가 다시 "true"로
 * 덮어써져서, Podfile 최상단에서 환경변수를 직접 강제 설정한다 (ENV[...] ||= 보다 먼저
 * 평가되도록 파일 맨 위에 둔다).
 */
function withPrecompiledModulesEnvOverride(config) {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');
      const marker = "ENV['EXPO_USE_PRECOMPILED_MODULES'] = '0'";
      if (!contents.includes(marker)) {
        contents = `${marker}\n${contents}`;
        fs.writeFileSync(podfilePath, contents);
      }
      return config;
    },
  ]);
}

/**
 * SDK 56의 "미리 컴파일된 Expo 모듈 바이너리 재사용" 기능(EXPO_USE_PRECOMPILED_MODULES)이
 * ExpoContacts/ExpoModulesCore 사이에 서로 안 맞는 버전을 조합해 dyld Symbol not found
 * 크래시를 유발하는 것으로 보여, 모든 Expo 모듈을 소스에서 새로 빌드하도록 강제한다.
 */
function withDisablePrecompiledExpoModules(config) {
  return withPodfileProperties(config, config => {
    config.modResults['EXPO_USE_PRECOMPILED_MODULES'] = 'false';
    return config;
  });
}

module.exports = function withCustomFixes(config) {
  config = withFirebaseStaticFramework(config);
  config = withDisablePrecompiledExpoModules(config);
  config = withPrecompiledModulesEnvOverride(config);
  return config;
};
