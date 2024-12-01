import { useState, useRef, useEffect } from 'react';
import {
  Title, Text, Card, Group, Stack, Paper,
  Image, ActionIcon, Tooltip, Box, rem,
  Progress, Tabs, SimpleGrid, AspectRatio,
  FileButton, Button, ThemeIcon, Badge,
  Slider, ColorInput, ScrollArea, Modal,
  UnstyledButton, Center, Overlay,
  Transition,
} from '@mantine/core';
import { useHover, useDisclosure } from '@mantine/hooks';
import {
  IconPlayerPlay, IconPlayerPause, IconVolume,
  IconVolume3, IconPlayerTrackNext, IconPlayerTrackPrev,
  IconPlayerSkipForward, IconPlayerSkipBack, IconPhoto,
  IconUpload, IconX, IconZoom, IconDownload,
  IconRotate, IconAdjustments, IconBrightnessHalf,
  IconContrastFilled, IconPalette, IconFilter,
} from '@tabler/icons-react';

interface ImageEditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hueRotate: number;
  overlayColor: string;
  overlayOpacity: number;
}

function ImageViewer({
  src,
  alt,
  withZoom = true,
  withControls = true,
}: {
  src: string;
  alt: string;
  withZoom?: boolean;
  withControls?: boolean;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const { hovered, ref } = useHover();
  const [editorState, setEditorState] = useState<ImageEditorState>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hueRotate: 0,
    overlayColor: '#000000',
    overlayOpacity: 0,
  });

  const getFilterStyle = () => {
    return {
      filter: `
        brightness(${editorState.brightness}%)
        contrast(${editorState.contrast}%)
        saturate(${editorState.saturation}%)
        blur(${editorState.blur}px)
        hue-rotate(${editorState.hueRotate}deg)
      `,
    };
  };

  return (
    <>
      <Box ref={ref} style={{ position: 'relative' }}>
        <Image
          src={src}
          alt={alt}
          style={getFilterStyle()}
        />
        
        <Transition mounted={hovered} transition="fade" duration={200}>
          {(styles) => (
            <Overlay
              gradient={`linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)`}
              center
              style={styles}
            >
              <Group>
                {withZoom && (
                  <ActionIcon variant="filled" color="dark" onClick={open}>
                    <IconZoom size={16} />
                  </ActionIcon>
                )}
                {withControls && (
                  <ActionIcon variant="filled" color="dark" onClick={open}>
                    <IconAdjustments size={16} />
                  </ActionIcon>
                )}
                <ActionIcon 
                  variant="filled" 
                  color="dark"
                  component="a"
                  href={src}
                  download
                >
                  <IconDownload size={16} />
                </ActionIcon>
              </Group>
            </Overlay>
          )}
        </Transition>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        padding={0}
        withCloseButton={false}
      >
        <Group wrap="nowrap" style={{ height: '80vh' }}>
          <Box style={{ flex: 1, height: '100%', position: 'relative' }}>
            <Image
              src={src}
              alt={alt}
              height="100%"
              fit="contain"
              style={getFilterStyle()}
            />
            <Overlay
              color={editorState.overlayColor}
              opacity={editorState.overlayOpacity}
            />
          </Box>

          {withControls && (
            <Paper p="md" style={{ width: 300 }} withBorder>
              <Stack>
                <Group justify="apart">
                  <Title order={4}>Image Editor</Title>
                  <ActionIcon onClick={close}>
                    <IconX size={16} />
                  </ActionIcon>
                </Group>

                <Stack gap="xs">
                  <Text size="sm">Brightness</Text>
                  <Slider
                    value={editorState.brightness}
                    onChange={(v) => setEditorState({ ...editorState, brightness: v })}
                    min={0}
                    max={200}
                    label={(v) => `${v}%`}
                    thumbChildren={<IconBrightnessHalf size={12} />}
                  />

                  <Text size="sm">Contrast</Text>
                  <Slider
                    value={editorState.contrast}
                    onChange={(v) => setEditorState({ ...editorState, contrast: v })}
                    min={0}
                    max={200}
                    label={(v) => `${v}%`}
                    thumbChildren={<IconContrastFilled size={12} />}
                  />

                  <Text size="sm">Saturation</Text>
                  <Slider
                    value={editorState.saturation}
                    onChange={(v) => setEditorState({ ...editorState, saturation: v })}
                    min={0}
                    max={200}
                    label={(v) => `${v}%`}
                    thumbChildren={<IconPalette size={12} />}
                  />

                  <Text size="sm">Blur</Text>
                  <Slider
                    value={editorState.blur}
                    onChange={(v) => setEditorState({ ...editorState, blur: v })}
                    min={0}
                    max={20}
                    label={(v) => `${v}px`}
                    thumbChildren={<IconFilter size={12} />}
                  />

                  <Text size="sm">Hue Rotate</Text>
                  <Slider
                    value={editorState.hueRotate}
                    onChange={(v) => setEditorState({ ...editorState, hueRotate: v })}
                    min={0}
                    max={360}
                    label={(v) => `${v}°`}
                    thumbChildren={<IconRotate size={12} />}
                  />

                  <Text size="sm">Overlay Color</Text>
                  <Group grow>
                    <ColorInput
                      value={editorState.overlayColor}
                      onChange={(v) => setEditorState({ ...editorState, overlayColor: v })}
                      format="hex"
                    />
                    <Slider
                      value={editorState.overlayOpacity}
                      onChange={(v) => setEditorState({ ...editorState, overlayOpacity: v })}
                      min={0}
                      max={1}
                      step={0.1}
                      label={(v) => `${Math.round(v * 100)}%`}
                    />
                  </Group>
                </Stack>

                <Button 
                  variant="light"
                  onClick={() => setEditorState({
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    blur: 0,
                    hueRotate: 0,
                    overlayColor: '#000000',
                    overlayOpacity: 0,
                  })}
                >
                  Reset All
                </Button>
              </Stack>
            </Paper>
          )}
        </Group>
      </Modal>
    </>
  );
}

function VideoPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const { hovered, ref } = useHover();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(currentTime + seconds, duration));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper withBorder ref={ref}>
      <Box style={{ position: 'relative' }}>
        <AspectRatio ratio={16 / 9}>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            onTimeUpdate={handleTimeUpdate}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AspectRatio>

        <Transition mounted={hovered} transition="fade" duration={200}>
          {(styles) => (
            <Overlay
              gradient="linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.7) 100%)"
              center={false}
              style={{ ...styles, padding: rem(16) }}
            >
              <Stack justify="space-between" h="100%">
                <Text fw={500} c="white">{title}</Text>
                
                <Stack gap="xs">
                  <Group justify="apart">
                    <Text size="sm" c="white">{formatTime(currentTime)}</Text>
                    <Text size="sm" c="white">{formatTime(duration)}</Text>
                  </Group>

                  <Slider
                    value={currentTime}
                    onChange={handleSeek}
                    min={0}
                    max={duration}
                    label={formatTime}
                    styles={{
                      track: { backgroundColor: 'rgba(255,255,255,0.2)' },
                      bar: { backgroundColor: 'white' },
                      thumb: { borderColor: 'white', backgroundColor: 'white' },
                    }}
                  />

                  <Group justify="apart">
                    <Group>
                      <ActionIcon variant="transparent" color="white" onClick={() => skipTime(-10)}>
                        <IconPlayerSkipBack size={20} />
                      </ActionIcon>
                      <ActionIcon variant="transparent" color="white" onClick={togglePlay}>
                        {isPlaying ? (
                          <IconPlayerPause size={32} />
                        ) : (
                          <IconPlayerPlay size={32} />
                        )}
                      </ActionIcon>
                      <ActionIcon variant="transparent" color="white" onClick={() => skipTime(10)}>
                        <IconPlayerSkipForward size={20} />
                      </ActionIcon>
                    </Group>

                    <Box style={{ position: 'relative' }}>
                      <ActionIcon
                        variant="transparent"
                        color="white"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        {volume === 0 ? (
                          <IconVolume3 size={20} />
                        ) : (
                          <IconVolume size={20} />
                        )}
                      </ActionIcon>

                      <Transition mounted={showVolumeSlider} transition="slide-up" duration={200}>
                        {(styles) => (
                          <Paper
                            shadow="md"
                            p="xs"
                            style={{
                              ...styles,
                              position: 'absolute',
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: rem(120),
                            }}
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                          >
                            <Slider
                              value={volume}
                              onChange={setVolume}
                              min={0}
                              max={1}
                              step={0.1}
                              label={(v) => `${Math.round(v * 100)}%`}
                              orientation="horizontal"
                            />
                          </Paper>
                        )}
                      </Transition>
                    </Box>
                  </Group>
                </Stack>
              </Stack>
            </Overlay>
          )}
        </Transition>
      </Box>
    </Paper>
  );
}

function FileUploadZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((current) => [...current, ...droppedFiles]);
    
    // Simulate upload progress
    droppedFiles.forEach((file) => {
      simulateUpload(file);
    });
  };

  const simulateUpload = (file: File) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress((current) => ({
        ...current,
        [file.name]: progress,
      }));
    }, 200);
  };

  const removeFile = (fileName: string) => {
    setFiles((current) => current.filter((f) => f.name !== fileName));
    setUploadProgress((current) => {
      const { [fileName]: _, ...rest } = current;
      return rest;
    });
  };

  return (
    <Stack>
      <Paper
        withBorder
        p="xl"
        style={{
          position: 'relative',
          backgroundColor: dragActive ? 'var(--mantine-color-blue-0)' : undefined,
          transition: 'background-color 200ms ease',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Center style={{ minHeight: rem(120) }}>
          <Stack gap="xs" align="center">
            <ThemeIcon size={48} radius="xl" variant="light">
              <IconUpload size={24} />
            </ThemeIcon>
            <Text size="xl" fw={500}>Drop files here</Text>
            <Text size="sm" c="dimmed">or click to select files</Text>
            <FileButton
              onChange={(files) => {
                if (files) {
                  setFiles((current) => [...current, ...Array.from(files)]);
                  Array.from(files).forEach(simulateUpload);
                }
              }}
              multiple
            >
              {(props) => (
                <Button variant="light" {...props}>
                  Select Files
                </Button>
              )}
            </FileButton>
          </Stack>
        </Center>
      </Paper>

      <ScrollArea.Autosize mah={400}>
        <Stack gap="xs">
          {files.map((file) => (
            <Paper key={file.name} withBorder p="xs">
              <Group justify="apart">
                <Group gap="xs">
                  <ThemeIcon variant="light" size="lg">
                    <IconPhoto size={16} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" lineClamp={1}>
                      {file.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                </Group>
                <Group gap="xs">
                  <Badge>
                    {uploadProgress[file.name] === 100 ? 
                      'Complete' : 
                      `${Math.round(uploadProgress[file.name] || 0)}%`
                    }
                  </Badge>
                  <ActionIcon 
                    color="red" 
                    variant="subtle"
                    onClick={() => removeFile(file.name)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Progress
                value={uploadProgress[file.name] || 0}
                size="xs"
                mt="xs"
                animated
              />
            </Paper>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
}

export function MediaShowcase() {
  return (
    <Stack gap="xl">
      <Title order={2}>Media & Files</Title>

      <Tabs defaultValue="images">
        <Tabs.List>
          <Tabs.Tab value="images">Image Gallery</Tabs.Tab>
          <Tabs.Tab value="video">Video Player</Tabs.Tab>
          <Tabs.Tab value="upload">File Upload</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="images" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Interactive Image Gallery</Title>
              <Text c="dimmed" size="sm">
                Hover over images to see controls. Click adjust to open the image editor.
              </Text>

              <SimpleGrid cols={3}>
                <ImageViewer
                  src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3"
                  alt="Mountains"
                />
                <ImageViewer
                  src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071"
                  alt="Forest"
                />
                <ImageViewer
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                  alt="Beach"
                />
              </SimpleGrid>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="video" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Custom Video Player</Title>
              <Text c="dimmed" size="sm">
                Hover over the video to see controls. Features include timeline preview,
                volume control, and quick navigation.
              </Text>

              <VideoPlayer
                src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
                title="Big Buck Bunny"
              />
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="upload" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Advanced File Upload</Title>
              <Text c="dimmed" size="sm">
                Drag and drop files or click to select. Features progress tracking
                and file management.
              </Text>

              <FileUploadZone />
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
} 