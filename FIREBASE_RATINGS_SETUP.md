# Firebase ratings setup

GitHub Protector uses Firebase Realtime Database only for anonymous ratings and short reviews. Scanner inputs, selected files, passwords and security results are never sent to Firebase.

## One-time setup

1. Open **Firebase Console → Authentication → Sign-in method**.
2. Enable **Anonymous** sign-in.
3. In **Authentication → Settings → Authorized domains**, add `armaanshashvat2014-dot.github.io` if it is not already listed.
4. Open **Realtime Database → Rules**.
5. Replace the rules with the contents of [`database.rules.json`](database.rules.json), then choose **Publish**.

The rules allow each anonymous user to create or update only their own rating. Public visitors can query only ratings of 4 stars or higher, limited to 20 results.

## Editing ratings

The project owner can edit or remove records in **Firebase Console → Realtime Database → Data → ratings**. Each child key is an anonymous Firebase user ID.

## Optional Firebase CLI deployment

After signing in with the Firebase CLI, run:

```sh
firebase use github-protector-27dbd
firebase deploy --only database
```

Do not add service-account private keys to this repository. The Firebase web configuration in `feedback.js` identifies the public Firebase project; database rules provide the access control.
