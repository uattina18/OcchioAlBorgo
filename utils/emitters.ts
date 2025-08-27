import { pushLocalAndStore } from "../utils/notify";

// quando qualcuno ti manda una richiesta di amicizia
export async function notifyFriendRequest(username: string, userId: string) {
  return pushLocalAndStore({
    type: "friend_request",
    title: "Nuova richiesta di amicizia",
    body: `${username} vuole seguirti`,
    data: { userId, username },
  });
}

// quando una tua foto riceve un like
export async function notifyPhotoLike(username: string, photoId: string) {
  return pushLocalAndStore({
    type: "photo_like",
    title: "Nuovo mi piace ❤️",
    body: `${username} ha messo Mi piace alla tua foto`,
    data: { username, photoId },
  });
}
