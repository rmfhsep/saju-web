# QA 대응 현황 (2026-07-21)

QA 시트 항목을 그대로 옮기고, 대응 결과와 완료 여부를 표기했습니다.
상태: ✅ 완료(코드) · 🟡 코드완료·값/재생성 필요 · 📋 정책/기획/데이터 대기

| # | 분류 | 우선순위 | 기대 결과 | 수정 사항 | 상태 | 대응 결과 |
|---|------|--------|-----------|-----------|:----:|-----------|
| 1 | 로그인/회원가입 | minor | 전체 동의 프레임 전체 선택 시 on↔off 스위치 | on↔off 동작 touch area 프레임 전체로 변경 | ✅ | 프레임 전체 터치(기존 대응 완료) |
| 2 | 온보딩 | minor | 사주 리포트 올해 연애운 '보통','높음' 뱃지 구분 | 뱃지 색상 구분(높음-빨강 / 보통-파랑 / 낮음-노랑) | ✅ | 낮음 뱃지 노랑(`#e5920a/#fff3df`)으로 변경 |
| 3 | 온보딩 | major | 사진 등록 가이드 바텀시트 닫기 방식 2가지 | 바텀시트 아래로 스와이프해서 닫기 적용 | ✅ | 스와이프 닫기 구현됨(기존 검수 완료) |
| 4 | 온보딩 | major | 사진 등록 area 전체 터치 영역으로 | 사진 등록 area 터치 영역 확인 필요 | ✅ | 슬롯 전체 터치(기존 검수 완료) |
| 5 | 공통 | critical | | 사진 롱프레스 순서 변경 | ✅ | 지터 임계값 14px + 즉시 포인터 캡처로 동작 개선 |
| 6 | 마이 | minor | | 별 아이콘, 숫자 텍스트 컬러 가이드와 동일하게 변경 필요 | ✅ | 별 골드 `#FFB020`(주황→골드), 숫자 `#1F1F1F` |
| 7 | 마이 | minor | | 리스트 내 아이콘 가이드와 동일하게 변경 필요 | 🟡 | 주요 아이콘 DS화, 마이 홈 리스트 커스텀 아이콘 일부 잔존 |
| 8 | 공통 | major | radio button, color, radius 4 | Selected Button - 디자인 시스템과 동일하게 변경 필요 | ✅ | RadioOption radius 4, `#E9F1FF/#B6D0FF`, radio `#1F1F1F` |
| 9 | 공통 | minor | | 스플래시 변경 필요 | ✅ | `src/screens/SplashScreen.tsx`가 `assets/Splash.png` 전체화면 노출로 교체(커스텀 JS 스플래시라 app.json 아닌 이 컴포넌트가 실제 표시) |
| 10 | 공통 | minor | | 앱 아이콘 변경 필요 | ✅ | icon.png + iOS AppIcon-1024 알파 제거(opaque, 파일 선명 검증). 잔상은 빌드/아이콘 캐시 → 앱 삭제 후 재빌드 필요 |
| 11 | 공통 | minor | | 슬라이더 바 - 디자인 시스템과 동일하게 변경 필요 | ✅ | track `#F4F4F5`, fill/thumb `#90B7FF` |
| 12 | 공통 | major | 라디오 버튼일 경우 화면 진입 시 무조건 최상단 항목 선택 | 화면 진입 시 최상단 항목 selected 상태로 변경 | ✅ | StepRadio 마운트 시 첫 항목 자동 선택 |
| 13 | 공통 | minor | | 라디오 버튼 - 디자인 시스템과 동일하게 변경 필요 | ✅ | 라디오 `#1F1F1F` 링/닷 |
| 14 | 온보딩 | minor | 나의 연애 기질에서 그래프랑 숫자가 붙어있어야 함 | 첨부 화면 참고 | ✅ | 숫자를 막대 바로 위에 attach(ScoreBar 재구성) |
| 15 | 마이,온보딩 | critical | 나의 연애 기질: 온보딩 '내 유형:설명' / 마이 줄글 확인 | 유형별 설명인지, 줄글 설명인지 확인 필요 | ✅ | 온보딩도 줄글로 통일(마이와 동일) |
| 16 | 마이 | minor | | 지인 차단 title, sub text : font size/color 화면과 상이 | 🟡 | figma 상세 치수 확인 후 조정 필요 |
| 17 | 마이 | critical | 알림 설정 → 기기 알림 [설정] 버튼 시 OS 알림 설정으로 이동 | [설정] 버튼 선택 시 OS 알림 설정 화면으로 이동 | ✅ | `bridgeOpenAppSettings()` 연결 |
| 18 | 공통 | minor | | 토글 버튼 - 디자인 시스템과 동일하게 변경 필요 | ✅ | on `#90B7FF` / off `#DFDFDF` |
| 19 | 공통 | minor | | 체크 박스 - 디자인 시스템과 동일하게 (내부 체크 작아보임) | ✅ | 체크 확대 + `#B6D0FF` bg/`#1F1F1F` 체크 |
| 20 | 마이 | major | 1. 서브 타이틀 좌 정렬 | 첨부 화면 참고 | ✅ | 프로필 편집 섹션 헤더 좌정렬 |
| 21 | 공통 | minor | top navigation과 서브 타이틀 간격 20 | 전체적으로 간격 20 확인 필요 | 🟡 | 온보딩 반영, 전 화면 일괄 점검 권장 |
| 22 | 마이 | minor | 최하단 간격 36 | 전체적으로 최하단 간격 36 확인 필요 | ✅ | 프로필 편집 `pb-9`(36) |
| 23 | 마이 | minor | | 선택한 태그 변경 아이콘 수정 필요 | ✅ | DS `PencilIcon`으로 교체 |
| 24 | 공통 | minor | text field vertical padding : 12 | text field - 디자인 시스템과 동일하게 변경 필요 | 🟡 | 현재 `h-[48px]` 고정 — auto-height 스펙이면 조정 필요 |
| 25 | 마이 | major | 자기소개: text field 채워졌을 때 태그 변경 시 확인 modal | 태그 변경 확인 modal 화면 필요 | ✅ | 내용 있을 때 "태그를 변경할까요?" 모달 |
| 26 | 마이 | critical | 자기소개: 성향 태그 8개 + 직접 입력 N개만 노출 | 태그 노출 확인 필요 | ✅ | 추천 태그 `slice(0,8)` |
| 27 | 마이 | critical | 스무스한 롱프레스 사진 순서 변경.. | 롱프레스 사진 순서 변경 | ✅ | 지터 임계값 상향 + 즉시 캡처(마이 편집 동일 적용) |
| 28 | 공통,마이 | minor | toast max width : 296 | 지인차단 차단 추가 시 toast 1줄로 노출 | ✅ | `max-w-[296px]` + 문구 단축, black/74 radius6 |
| 29 | 마이 | critical | 문의하기 선택 시 카카오톡 비즈니스 채널로 이동 | 이동 경로 변경 필요 | 🟡 | 카카오 채널 이동 코드 완료, **실제 채널 URL 교체 필요** |
| 30 | 공통 | minor | list selected : 텍스트 gray 850 | 디자인 시스템과 동일하게 변경 필요 | ✅ | 선택 텍스트 `#1F1F1F`, 체크만 파랑 |
| 31 | 마이 | major | | 직업 수정 진입 시 입력한 직업 보이도록 수정 필요 | ✅ | 동일 직업 재선택 시 jobDetail 유지 |
| 32 | 마이,온보딩 | critical | 타이틀 "직업을 알려주세요." / 직업 리스트 라디오 X, list cell | 직업 선택 플로우 전반 수정 | ✅ | 전문직도 list cell화, 간격 40/20 |
| 33 | 마이 | minor | 내 정보 수정 진입 시 CTA 저장 X, top nav text button | 버튼 유형·위치·레이블 변경 필요 | ✅ | EditHeader `action`(저장) 7개 화면 적용 |
| 34 | 공통 | major | | 내 정보 수정 진입 시 1초 로딩, 화면 바로 뜨게 개선 | ✅ | 로딩 게이트 제거, 즉시 렌더 |
| 35 | 공통 | major | 아이콘/사이즈/텍스트 컬러/사이즈 | Bottom navigation - 디자인 시스템과 동일하게 변경 필요 | ✅ | 추천=home, active `#1F1F1F`+pill, inactive `#949494`, active 채움 |
| 36 | 로그인/회원가입 | critical | 탈퇴 회원 30일 이내 재가입 시 재가입 불가 화면 노출 | | 🟡 | WithdrawnPhone 모델+차단화면 구현. **`prisma db push` 필요** |
| 37 | 로그인/회원가입 | minor | CTA : secondary button | 안내 이미지 내 툴팁 위치 수정, CTA Color 변경 필요 | ✅ | 인증코드 보내기 = secondary **톤온톤(bg #E9F1FF, 파란 글자)** 로 수정 + 툴팁 위치 조정 |
| 38 | 로그인/회원가입 | minor | | 로딩 아이콘 변경 필요 | ✅ | 인증 확인 로딩 = shield_check 아이콘(디자인 1:2420과 동일) |
| 39 | 로그인/회원가입 | critical | 본인인증 완료 후 서비스 이용 동의 Bottomsheet 노출 | 인증 → 서비스 이용 동의 → 비밀번호 설정 플로우 확인 | ✅ | 회원가입만 비밀번호 화면 위 **딤+바텀시트**로 동의(뒤 화면 보임), 재로그인은 약관 없이 바로 비밀번호 |
| 40 | 로그인/회원가입 | minor | | 비밀번호 설정 화면 : 계정 확인 아이콘 변경 필요 | ✅ | DS `CheckCircleIcon`으로 교체 |
| 41 | 로그인/회원가입 | major | 비밀번호 확인 place holder : 동일한 비밀번호 입력 | Place holder 수정 | ✅ | "동일한 비밀번호 입력" |
| 42 | 로그인/회원가입 | minor | Bottom sheet 내 padding 20 동일 | 서비스 이용동의 bottom sheet padding 20으로 변경 | ✅ | `px-5`(20) |
| 43 | 온보딩 | critical | 출생 정보 입력 진입 시 뒤로가기 불가 | Top navigation 미노출 | ✅ | 뒤로가기 제거(spacer만) |
| 44 | 온보딩 | minor | Text field focused color : blue | text field 상태별 디자인 확인 후 수정 | ✅ | focus `#90B7FF` |
| 45 | 온보딩 | minor | | Selected Button - 디자인 시스템과 동일하게 변경 필요 | ✅ | 토글/라디오 radius4·색상 반영 |
| 46 | 온보딩 | minor | | 태어난 시간 [모름] check box 디자인 시스템과 동일하게 | ✅ | `#B6D0FF` bg/`#1F1F1F` 체크 확대 |
| 47 | 마이,온보딩 | critical | 출생 시간 선택 wheel 분 단위 : 1분 단위 | 10분 단위를 1분 단위로 변경 | ✅ | MINUTES 00~59(온보딩+마이) |
| 48 | 온보딩 | critical | | 게임으로 별 적립하는 정책 필요 | 📋 | 정책 확정 필요(담당 예림) |
| 49 | 온보딩 | minor | | 연애운 리포트 : 주의 포인트 bg color, 주의 아이콘 변경 | ✅ | amber bg + DS `WarningIcon` |
| 50 | 온보딩 | minor | | 지인 차단 : 완료 시 check 아이콘 변경 필요 | ✅ | DS `CheckCircleIcon`(파랑 원형) |
| 51 | 온보딩 | critical | 프로필 만들기 진입 시 뒤로가기 불가 | Top navigation 미노출 | ✅ | StepIntro BackButton 제거 |
| 52 | 온보딩 | minor | 아이콘/텍스트 시각 보정 적용 | 아이콘/텍스트 위치 확인 및 수정 필요 | ✅ | top nav 제거로 중앙정렬 상향 |
| 53 | 온보딩 | minor | 닉네임 입력 text field 숫자 카운트 미노출 | 카운트 삭제, 12자 초과 입력 불가 동작만 | ✅ | 카운트 삭제(12자 제한 유지) |
| 54 | 공통 | major | CTA disable color : bg - gray 250, text - white | CTA disable bg/text 디자인 시스템과 동일하게 | ✅ | `#E8E8E8` + white |
| 55 | 온보딩 | minor | 거주지 입력 진입 시 전체 시군구 목록 디폴트 노출 | 전체 시군구 목록 노출 필요 | ✅ | 검색어 없을 때 전체 리스트 |
| 56 | 공통 | minor | Search field radius : 4 | search field - 디자인 시스템과 동일하게 변경 필요 | ✅ | radius 4 + DS SearchIcon |
| 57 | 마이,온보딩 | critical | 거주지 선택 시 구단위까지 노출 | 행정구역 데이터베이스 최신 업데이트 확인 필요 | 📋 | 화성시 구 명칭 확인 후 `ALL_LOCATIONS` 반영 (미반영) |
| 58 | 온보딩 | minor | Search field ↔ 직업군 리스트 간격 20 | 직업 설정: search field와 리스트 간격 20 | ✅ | `mt-5`(20) |
| 59 | 온보딩 | minor | 키 입력 시 text field fill / CM 20, semibold | 키 입력 text field - UI Guide와 동일하게 | ✅ | `flex-1` + `text-[20px] font-semibold` |
| 60 | 공통,온보딩 | minor | 프로필 설정 시 Title ↔ 입력 영역 간격 : 40 | Title↔입력 영역 간격 40으로 전체 변경 | ✅ | step 공통 `gap-10`(40) |
| 61 | 마이 | minor | 프로필 사진 업로드 시 참고 화면과 동일한 로딩 | 마이 사진 업로드 로딩 온보딩과 동일하게 | ✅ | 슬롯별 스피너 적용 |
| 62 | 온보딩 | minor | | 직접 입력 태그 삭제 아이콘 - 디자인시스템과 동일하게 | ✅ | DS `CloseCircleIcon` |

---

## 남은 수동 작업 (코드 외)
- `cd mobile && npx expo prebuild` — 스플래시 네이티브 반영 (#9)
- `npx prisma db push` — WithdrawnPhone 테이블 생성 (#36)
- 값 입력 필요: 카카오 채널 URL (#29), 화성시 구 명칭 (#57)
- 정책/에셋: 게임 별 적립 정책(#48), 로딩 아이콘 에셋(#38), 마이 리스트/지인차단 아이콘 세부(#7,#16)
