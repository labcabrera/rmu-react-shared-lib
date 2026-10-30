import React, { FC, PointerEvent, ReactNode, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, ButtonBase, ClickAwayListener, Fade, IconButton, Paper, Popper, Stack, Typography } from '@mui/material';

/** Numbers behind a rule's value, as the combat API sends them (`{ mode: 'partial', skill: 25 }`). */
export type RuleParams = Record<string, number | string | boolean>;

/** Time the mouse rests on a row before its preview opens, so that sweeping over a list opens nothing. */
const HOVER_DELAY = 350;

const signedParam = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/**
 * The inputs of a rule as `label: value` lines: `rule-param-<name>` labels, translated text values and signed
 * numbers for penalties (negative ones). A boolean shows as yes or no.
 */
export const RuleParamList: FC<{ params: RuleParams }> = ({ params }) => {
  const { t } = useTranslation();
  const entries = Object.entries(params);
  if (entries.length === 0) return null;
  const format = (value: number | string | boolean) =>
    typeof value === 'boolean'
      ? t(value ? 'yes' : 'no')
      : typeof value === 'number'
        ? value < 0
          ? signedParam(value)
          : String(value)
        : t(value, { defaultValue: value });
  return (
    <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 2, rowGap: 0.25 }}>
      {entries.map(([name, value]) => (
        <React.Fragment key={name}>
          <Typography component="dt" variant="caption" color="text.secondary">
            {t(`rule-param-${name}`, { defaultValue: name })}
          </Typography>
          <Typography
            component="dd"
            variant="caption"
            sx={{ m: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
          >
            {format(value)}
          </Typography>
        </React.Fragment>
      ))}
    </Box>
  );
};

/**
 * Why a value is what it is (spec 051), for web and tablets alike. A click or a tap on the row pins a panel with the
 * explanation; with a mouse, resting on the row opens it as a preview that closes when the mouse leaves. Touch never
 * depends on hover: the pointer type of each event decides, so a touch laptop gets both.
 */
type RuleHintProps = {
  /** The row that opens the explanation (the `row` variant). */
  children?: ReactNode;
  /** Heading of the panel: what is explained. */
  title: ReactNode;
  /** Plain text of why. */
  description?: ReactNode;
  params?: RuleParams;
  /** Reference in the books (`§9.6`). */
  reference?: string;
  /** `row` wraps its children; `icon` is an information button, for form fields (spec 052). */
  variant?: 'row' | 'icon';
  /** Accessible name of the icon button (default: the title when it is text). */
  ariaLabel?: string;
};

const RuleHint: FC<RuleHintProps> = ({
  children,
  title,
  description,
  params,
  reference,
  variant = 'row',
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const id = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState<'preview' | 'pinned' | false>(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || open) return;
    timer.current = setTimeout(() => setOpen('preview'), HOVER_DELAY);
  };
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(timer.current);
    setOpen((state) => (state === 'preview' ? false : state));
  };
  const toggle = () => {
    clearTimeout(timer.current);
    setOpen((state) => (state === 'pinned' ? false : 'pinned'));
  };

  return (
    <>
      {variant === 'icon' ? (
        <IconButton
          ref={anchorRef}
          onClick={toggle}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          aria-expanded={!!open}
          aria-controls={open ? id : undefined}
          aria-label={
            ariaLabel ?? (typeof title === 'string' ? t('rule-help-of', { name: title }) : t('rule-explanation'))
          }
          sx={{ width: 40, height: 40 }}
        >
          <InfoOutlinedIcon fontSize="small" color={open ? 'primary' : 'action'} />
        </IconButton>
      ) : (
        <ButtonBase
          ref={anchorRef}
          onClick={toggle}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          aria-expanded={!!open}
          aria-controls={open ? id : undefined}
          sx={{
            display: 'block',
            width: '100%',
            minHeight: 40,
            textAlign: 'left',
            borderRadius: 1,
            px: 0.5,
            mx: -0.5,
            boxSizing: 'content-box',
            '&:hover, &[aria-expanded="true"]': { bgcolor: 'action.hover' },
            '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main' },
          }}
        >
          {children}
        </ButtonBase>
      )}
      <Popper
        open={!!open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Box>
              <ClickAwayListener
                onClickAway={(event) => {
                  // The row toggles itself: a click on it is not a click away
                  if (!anchorRef.current?.contains(event.target as Node)) setOpen(false);
                }}
              >
                <Paper
                  id={id}
                  role="dialog"
                  aria-label={t('rule-explanation')}
                  elevation={8}
                  sx={{ p: 1.5, maxWidth: 340 }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">{title}</Typography>
                    {description && (
                      <Typography variant="body2" color="text.secondary">
                        {description}
                      </Typography>
                    )}
                    {params && <RuleParamList params={params} />}
                    {reference && (
                      <Typography variant="caption" color="text.secondary">
                        {t('rule-reference', { reference })}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
};

/**
 * The explanation of a form field (spec 052): an information button next to its label, with what the option does,
 * what raising or lowering it implies, its default and its reference. Same behaviour as RuleHint.
 */
export const FieldHint: FC<Omit<RuleHintProps, 'children' | 'variant'>> = (props) => (
  <RuleHint {...props} variant="icon" />
);

export default RuleHint;
