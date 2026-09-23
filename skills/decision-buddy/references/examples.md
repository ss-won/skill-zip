# Worked examples

Conversations showing pacing in each mode, an open gift request, plus a settings change. They illustrate the *shape*, not a script — adapt the questions to the actual decision.

---

## 1. 빠르게 — lunch

**User:** 점심 뭐 먹지. 김치찌개, 쌀국수, 샐러드 중에 못 고르겠어

**Assistant:**
> ⚡ 빠르게 골라볼게요 · 더 따져보고 싶으면 "꼼꼼히"라고 해주세요
>
> ✅ **쌀국수**
> 왜: 셋 중 가장 가볍게 든든하고, 오후에 졸리지 않아요.
> 이럴 땐 다른 쪽: 날이 쌀쌀하거나 어제 저녁을 거의 못 먹었으면 → 김치찌개 / 저녁 약속이 거하게 있으면 → 샐러드
> 지금 할 일: 지금 출발하면 줄 서기 전에 들어가요.

No questions: nothing about their situation would change this enough to be worth a round-trip. One pick, two flip conditions, done.

---

## 2. 적당히 — state management library

**User:** 새 Next.js(app router) 프로젝트 상태관리 zustand, jotai, redux toolkit 중에 고민 중. 팀 3명.

**Assistant (round 1):**
> 🙂 몇 가지만 여쭤볼게요 · 바로 원하면 "그냥 골라줘"
>
> 셋 다 충분히 좋은 선택이라, 상황에 따라 갈리는 지점만 여쭤볼게요.
> 1. 서버 데이터(fetch 결과)는 어떻게 관리할 예정인가요? (a) TanStack Query/SWR 따로 씀 (b) 상태관리 라이브러리에 같이 넣을 예정 (c) 아직 미정
> 2. 전역 상태의 모양은? (a) 몇 개 안 되는 UI 상태(모달, 테마 등) (b) 서로 얽힌 파생 상태가 많음 (c) 복잡한 도메인 로직/이벤트 흐름
> 3. 팀원 경험은? (a) Redux 익숙 (b) 가벼운 훅 기반이 익숙 (c) 제각각
>
> "1a 2b"처럼 짧게 답해도 되고, 그냥 편하게 말해도 돼요.

**User:** 1a 2a 3b

**Assistant (pick + table):**
> ✅ **추천: zustand**
>
> | 기준 | zustand | jotai | RTK |
> |---|---|---|---|
> | 팀이 배우기 쉬움 ★★★ | 5 | 4 | 2 |
> | 단순 UI 상태에 맞음 ★★ | 5 | 4 | 3 |
> | 파생 상태 표현 ★ | 3 | 5 | 3 |
> | **점수** | **28** | 25 | 15 |
>
> 왜: 서버 상태는 Query가 맡으니 전역엔 가벼운 UI 상태만 남고, 팀이 훅 방식에 익숙해서 가장 빨리 굴러가요.
> 이럴 땐 다른 쪽: 폼/필터처럼 서로 얽힌 파생 상태가 늘어나면 → jotai / 이벤트 추적·미들웨어·엄격한 규칙이 필요한 복잡한 도메인이면 → RTK
> 지금 할 일: 모달·테마 store 하나만 zustand로 만들어서 SSR hydration까지 확인해보기 (30분).

---

## 3. 꼼꼼히 — job offers

**User:** 오퍼 두 개 받았는데 결정을 못하겠어. A는 시리즈B 스타트업, 연봉 +20%에 스톡옵션. B는 대기업 계열, +10%에 안정적. 둘 다 프론트엔드.

**Assistant (round 1 — deal-breakers & priorities):**
> 🔍 중요한 결정이라 꼼꼼히 갈게요 · 줄이고 싶으면 "빠르게"
>
> 1. 향후 3년간 제일 중요한 건? (a) 연봉/자산 (b) 성장 속도·오너십 (c) 워라밸·안정성 (d) 커리어 브랜드
> 2. 스타트업이 1~2년 안에 어려워지면? (a) 괜찮음, 경험이 남음 (b) 꽤 타격 (c) 절대 안 됨
> 3. 각 팀에서 실제로 할 일은 어느 쪽이 더 끌려요? (a) A (b) B (c) 비슷
> 4. 지금 마음은 어느 쪽으로 조금이라도 기울어 있어요? (a) A (b) B (c) 진짜 반반

**User:** 1b 2a 3a 4b

**Assistant (round 2 — resolving the tension):**
> 흥미로운 점: 우선순위(성장, 리스크 감내)와 하고 싶은 일은 A를 가리키는데, 마음은 B로 기울어 있어요. 그 이유를 좁혀볼게요.
> 1. B로 기우는 이유에 가장 가까운 건? (a) 불안감 (b) 주변 시선/브랜드 (c) B 팀 사람이 좋았음 (d) 모르겠음
> 2. A의 스톡옵션은 사실상 0이라고 가정해도 A가 끌려요? (a) 예 (b) 아니요

**User:** 1a 2a

**Assistant (pick + table + what flips it):**
> ✅ **추천: A**
>
> | 기준 | A 스타트업 | B 대기업 |
> |---|---|---|
> | 성장·오너십 ★★★ | 5 | 3 |
> | 하고 싶은 일 ★★★ | 5 | 3 |
> | 안정성 ★ | 2 | 5 |
> | 현금 보상 ★★ | 4 | 3 |
> | **점수** | **40** | 29 |
>
> 뒤집히려면: 안정성을 제일 중요하게 볼 때만 B가 따라잡아요 — 그런데 2번 질문에서 "어려워져도 괜찮다"고 하셨죠.
>
> 왜: 3년 우선순위가 성장이고, 스톡옵션을 0으로 봐도 A가 끌린다고 했어요. B 쪽 기울기는 불안감인데, 그 불안은 리스크 감내 답과 충돌해요.
> 이럴 땐 다른 쪽: A의 런웨이(회사가 버틸 수 있는 기간)가 12개월 미만이거나 직속 리드가 곧 나간다면 → B / 1~2년 내 큰 고정지출 계획(이사·대출 등)이 있으면 → B
> 지금 할 일: A에 "현재 런웨이"와 "합류할 팀 리드 재직 기간" 두 가지만 오늘 메일로 물어보기. 답이 괜찮으면 사인.

Note how round 2 targets the gap between stated priorities and gut lean — that gap *is* the gray zone for this person.

---

## 4. 적당히 — open gift request (no candidates yet)

**User:** 친구 생일 선물 추천해줘. 5만원 정도. 친구는 게임회사 PM이야

**Assistant:** [clickable choice tool — mode hint inside the first question because text before a tool call may not be shown]
> 1. 🙂 몇 가지만 여쭤볼게요 (바로 원하면 "그냥 골라줘") — 친구 평일은 어떤 편이에요? (a) 회의 많고 하루 종일 모니터 앞 (b) 야근·크런치 잦음 (c) 잘 모르겠음
> 2. 친구가 이미 갖고 있을 법한 건? (a) 좋은 키보드·마우스 (b) 게임기 (c) 잘 모르겠음
> 3. 생일이 언제예요? (a) 이번 주 (b) 다음 주 이후

Why this shape: no candidates were given, so it still runs (open recommendation). The volunteered detail — 게임회사 PM — is the strongest signal, so questions build on it (their day, what they already own) instead of generic "취향" questions. Price is low but a person is involved, so auto mode is 적당히, not 빠르게. The birthday date is asked because it changes the next step.

**User:** 1a 2a 3a, 금요일이야

**Assistant:**
> ✅ **추천: 목·어깨 마사지기**
>
> | 기준 | 마사지기 | 드립백 세트 | 블루라이트 안경 |
> |---|---|---|---|
> | 모니터 앞 하루에 도움 ★★★ | 5 | 3 | 4 |
> | 이미 가졌을 확률 낮음 ★★ | 4 | 4 | 3 |
> | 5만원 안 ★ | 4 | 5 | 5 |
> | **점수** | **27** | 22 | 23 |
>
> 왜: 회의 많고 하루 종일 모니터 앞이면 제일 매일 체감되고, 키보드·마우스처럼 이미 있을 확률도 낮아요.
> 이럴 땐 다른 쪽: 친구가 커피를 꼭 챙겨 마시는 편이면 → 드립백 세트 / 안경을 이미 쓰는 친구면 → 블루라이트 안경은 빼기
> 지금 할 일: 생일이 금요일이라 **오늘 안에 새벽·당일 배송 되는 걸로 주문**하세요. 내일 주문하면 금요일 도착이 빠듯해요.

---

## 5. Changing the default ("설정")

**User:** 앞으로 나한텐 질문 좀 줄여줘. 매번 묻는 거 귀찮아

**Assistant:** (mode is clear from the message — no question needed; saved via memory tool)
> 알겠어요! 앞으로는 ⚡ **빠르게**로, 거의 안 묻고 바로 골라드릴게요.
> 큰 결정이라 더 따져보고 싶을 땐 "꼼꼼히"라고만 해주세요. 기본을 다시 바꾸려면 "설정"이라고 하면 돼요.

**User:** 설정

**Assistant:** [clickable choice tool]
> 앞으로 기본은 어떻게 할까요?
> (a) ⚡ 빠르게 — 거의 안 묻고 바로 골라줌 (지금)
> (b) 🙂 적당히 — 2~4개만 묻고 골라줌
> (c) 🔍 꼼꼼히 — 여러 번 물어보고 표로 비교
> (d) 🪄 알아서 — 고민 크기 보고 자동으로

No file paths, no "profile", no "intensity" — just what will happen.
