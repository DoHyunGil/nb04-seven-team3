export default async function sendDiscordMessage(webhookUrl, message) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message, // 전송할 메시지 내용
        username: "My Bot", // 봇 이름
        avatar_url: "https://example.com/avatar.png", // 봇 프로필 이미지 URL
      }),
    });

    if (!response.ok) {
      console.error("웹훅 메시지 전송 실패:", await response.text());
    } else {
      console.log("웹훅 메시지 전송 성공");
    }
  } catch (error) {
    console.error("오류 발생:", error);
  }
}

// 사용 예시
// const webhookUrl = "여기에 복사한 디스코드 웹훅 URL을 붙여넣으세요";
// const message = "안녕하세요! 이것은 자바스크립트로 보낸 메시지입니다.";

// sendDiscordMessage(webhookUrl, message);
