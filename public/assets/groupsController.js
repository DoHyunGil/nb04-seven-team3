import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class GroupsContriller {
  /**
   *  시스템명 : SEVEN
   *  API명 : 그룹 등록
   *  @param : {*} RequestBody
  */
  createGroupRecord = async (req, res) => {
    console.log('groupsController createGroupRecord()..');

    try{

        const { 
          name,
          nickname,
          password,
          description,
          imgUrl,
          tag,
          discordWebUrl,
          discordServerUrl
        } = req.body;

        //필수값 검증
        if(
          !name &&
          !nickname &&
          !password &&
          !description &&
          !imgUrl &&
          !tag &&
          !discordWebUrl &&
          !discordServerUrl
        ) {
          return res.status(400).json({ error: "필수 작성 내용이 누락되었습니다."  })
        };

        const group = await prisma.group.create({
              data: req.body
        });
        res.status(200).send(group);
            
      } catch(error) {
          console.log(error);
          res.status(400).json( { error: '그룹등록에 실패했습니다!'} );
      }
  };

   /**
   *  시스템명 : SEVEN
   *  API명 : 그룹 수정
   *  @param : {*} RequestBody
  */
   updateGroupRecord = async (req, res) => {
    try{
          const id = parseInt(req.params.id);
          const { name, nickname, password, description, imgUrl, tag, discordWebUrl, discordServerUrl } = req.body;
          console.log(`groupsController updateGroupRecord()..  groupId:${id} `);

          const group = await prisma.group.update({
            where: { id },  
            data: { name, nickname, password, description, imgUrl, tag, discordWebUrl, discordServerUrl },
          });
          res.status(200).send(group);
            
        } catch(error) {
            console.log(error);
            res.status(400).json( { error: '그룹수정에 실패했습니다!'} );
        }
   };

   /**
   *  시스템명 : SEVEN
   *  API명 : 그룹 삭제
   *  @param : {*} RequestBody
   */
   deleteGroupRecord = async (req, res) => {
    try{
          const id = parseInt(req.params.id);
          console.log(`groupsController deleteGroupRecord()..  groupId:${id} `);

          const group = await prisma.group.delete({
            where: { id }  
          });
          res.status(200).send(group);
            
        } catch(error) {
            console.log(error);
            res.status(400).json( { error: '그룹삭제에 실패했습니다!'} );
        }
   };

}

export default new GroupsContriller();