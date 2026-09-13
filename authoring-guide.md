# projects.json 작성 가이드

새 웹 서비스를 포트폴리오에 추가할 때, 이 문서의 규칙에 맞춰 `projects.json`의
`projects` 배열에 객체 하나를 추가한다.

> **사용법 (AI에게 시킬 때)**
> 서비스의 README / package.json / 소스 코드와 **이 문서**를 함께 제공하고,
> "이 규칙에 맞춰 projects.json에 항목을 추가해줘"라고 요청한다.
> Claude Code 환경이라면 저장소를 열고 곧바로 요청하면 파일까지 수정해 준다.

---

## 필드 규칙

| 필드 | 필수 | 규칙 |
|------|:---:|------|
| `id` | ★ | 소문자 kebab-case slug. 예: `map-lounge`. **다른 프로젝트와 중복 금지**. URL 앵커(`#map-lounge`)로 사용됨 |
| `title` | ★ | 서비스 정식 명칭 |
| `summary` | ★ | 카드용 한 줄 소개. **80자 이내**, 명사형 또는 "~플랫폼/시스템" 형태로 간결하게 |
| `description` | ★ | **문자열 배열**. 각 요소 = 한 문단. 2~4문단, 말투는 **"~합니다"** 로 통일 |
| `tags` | ★ | 카드에 노출할 대표 기술 **3~5개**. `techStack`에서 핵심만 추린 것 |
| `techStack` | ○ | 카테고리별 기술 목록. 키는 **`frontend` / `backend` / `database` / `infra` 만 사용**. 해당 없으면 키 생략 또는 `[]` |
| `features` | ○ | 주요 기능 목록(배열). 각 항목은 짧은 명사형 구절 |
| `thumbnail` | ○ | 대표 이미지 경로. 없으면 `""` → 자동으로 플레이스홀더 표시 |
| `screenshots` | ○ | 스크린샷 이미지 경로 배열. 없으면 `[]` |
| `links` | ○ | `demo`, `github` URL. 없으면 `""` |
| `featured` | ○ | `true`면 목록 상단 우선 정렬. 기본 `false` |

## 허용값(enum) — 반드시 지킬 것

- `techStack` 카테고리 키: `frontend`, `backend`, `database`, `infra`

## 값을 모를 때

- 확실하지 않은 필드는 **임의로 지어내지 말 것**.
- 문자열이면 `""`, 배열이면 `[]`로 비워둔다.
- 비운 필드는 화면에서 자동으로 렌더링되지 않는다(빈 섹션이 안 생김).

## 검증

`projects.json` 상단에 `"$schema": "./projects.schema.json"`가 걸려 있어,
VS Code 등에서 필수값 누락·오타·enum 위반·id 형식 오류를 실시간으로 잡아준다.
작성 후 빨간 줄이 없는지 확인한다.

---

## 완성 예시 (few-shot)

아래 형태를 그대로 따른다.

```json
{
  "id": "map-lounge",
  "title": "Map Lounge",
  "summary": "사용자가 자유롭게 공간 정보를 공유하고 소통할 수 있는 맵 기반 커뮤니티 플랫폼",
  "description": [
    "공간 정보와 사용자 커뮤니티를 결합한 플랫폼입니다. VWorld 및 NGII의 배경 지도를 연동하고, 사용자가 원하는 위치 기반 데이터를 시각화할 수 있도록 설계했습니다.",
    "PostGIS를 활용한 공간 데이터베이스 구축 및 GeoServer를 통한 효율적인 타일 서비스 제공에 집중했습니다."
  ],
  "tags": ["Spring Boot", "GeoServer", "PostGIS", "React"],
  "techStack": {
    "frontend": ["React"],
    "backend": ["Spring Boot", "Java"],
    "database": ["PostgreSQL", "PostGIS"],
    "infra": ["GeoServer"]
  },
  "features": [
    "VWorld / NGII 배경 지도 연동",
    "위치 기반 데이터 시각화",
    "PostGIS 기반 공간 쿼리 및 GeoServer 타일 서비스"
  ],
  "thumbnail": "",
  "screenshots": [],
  "links": { "demo": "", "github": "" },
  "featured": true
}
```
