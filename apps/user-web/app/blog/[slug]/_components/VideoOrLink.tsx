export function VideoOrLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isVideo = props.href?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);

  if (isVideo) {
    return (
      <video src={props.href} autoPlay muted controls>
        {`Sorry, your browser doesn${"'"}t support embedded videos.`}
      </video>
    );
  }

  return <a {...props} />;
}
