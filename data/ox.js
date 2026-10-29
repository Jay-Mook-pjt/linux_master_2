/* =========================================================
   ✏️ OX 문제 목록
   - id          : 겹치지 않는 이름 (바꾸지 마세요)
   - category    : (선택) 카테고리
   - question    : 문장
   - answer      : "O" 또는 "X"
   - explanation : 해설
   ========================================================= */
window.OX = [
  {
    id: "ox1",
    category: "리눅스의 이해",
    question: "리눅스는 비선점형 멀티태스킹을 지원한다.",
    answer: "X",
    explanation: "리눅스는 **선점형** 멀티태스킹이에요. OS가 각 프로그램에 실행 순서를 강제로 나눠줍니다.",
  },
  {
    id: "ox2",
    category: "계정 관리",
    question: "`/etc/passwd` 파일에 암호화된 비밀번호가 저장되어 있다.",
    answer: "X",
    explanation: "실제 암호는 `/etc/shadow`에 있고, `/etc/passwd`에는 `x`만 표시돼요.",
  },
  {
    id: "ox3",
    category: "리눅스 설치",
    question: "확장(Extended) 파티션은 디스크 하나에 1개만 만들 수 있다.",
    answer: "O",
    explanation: "확장 파티션은 디스크당 **딱 1개**. 그 안에 논리 파티션을 여러 개 만들어요.",
  },
  {
    id: "ox4",
    category: "기본 명령어",
    question: "`kill PID` 를 옵션 없이 쓰면 SIGKILL(9) 시그널을 보낸다.",
    answer: "X",
    explanation: "기본값은 **SIGTERM(15)**. 강제 종료는 `kill -9 PID`예요.",
  },
];
