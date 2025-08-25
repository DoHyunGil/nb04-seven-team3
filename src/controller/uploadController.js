class UploadController {
  async imagesUpload(req, res) {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
    }
    // 요청으로부터 프로토콜과 호스트 추출
    const protocol = req.protocol;
    const host = req.get("host");
    // 전체 URL목록 생성
    const fileUrls = files.map(
      (file) => `${protocol}://${host}/images/${file.filename}`
    );

    res.status(200).json({ urls: fileUrls });
  }
}

export default new UploadController();
