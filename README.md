# BuzzSpot

Study room booking for Georgia Tech, built for the Georgia Tech Solution Challenge.

Find what's nearby, preview rooms in 3D, and book in seconds.

## Features

- **Book by selection:** filter by room type, date, start and end time (up to 2 hours), and group size.
- **Interactive map:** pick a building, then a floor, then a room in 3D, and book it.
- **Near Me:** share your location (or pick a campus spot) to sort rooms by distance on the campus map.
- **3D previews:** every room, with one chair per seat.
- **Accounts:** sign in with an @gatech.edu email. Profiles include major and student level, which decide which rooms you can book.
- **Bookings:** one reservation at a time, a confirmation email with check-in and cancel links, and a calendar invite.
- **Check-in:** enter the code from the iPad outside the room within 10 minutes of the start time, or the room is released.

## Run it

Open `index.html` in Chrome, Safari or Edge. There's no build step.

## Publish with GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then click **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Confirmation emails

- **Works with no setup:** after booking, **Send to my email** opens the student's mail app with the confirmation filled in.
- **Automatic sending:** create a free [EmailJS](https://www.emailjs.com) account and paste its three IDs into `const EMAILJS=` in `index.html`. EmailJS public keys are meant to be in web pages, so this is safe for a public repository.
- **Your own server:** `email-addon/` has code for a Cloudflare Worker that sends through Resend. See `email-addon/README.md`. Keep the Resend API key as a Worker secret. **Never commit it to this repository.**

## Limits of this prototype

- Accounts and bookings are saved in the browser of the device that made them. They aren't shared between devices, so two people could book the same room. A real launch needs a server database.
- Room access rules are in `const ACCESS=` in `index.html`. The Graduate Student Community rule matches the GT Library. The Scheller and George Tower rules are assumptions to confirm with GT.
- Live library and Scheller availability needs the server from the original project. Without it, the site uses built-in sample availability.
