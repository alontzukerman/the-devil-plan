import React from 'react';
import { clsx } from 'clsx';
import { Label, type LabelProps } from '../Label';
import { Input, type InputProps } from '../Input';

export interface FormFieldProps {
    // Label props
    label?: string;
    required?: boolean;
    labelSize?: LabelProps['size'];
    labelVariant?: LabelProps['variant'];
    labelProps?: Omit<LabelProps, 'children' | 'size' | 'variant' | 'required'>;

    // Input props
    inputProps?: InputProps;

    // Error handling
    error?: string | boolean;
    helperText?: string;

    // Layout
    className?: string;
    fullWidth?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    required = false,
    labelSize = 'md',
    labelVariant = 'dark',
    labelProps,
    inputProps,
    error,
    helperText,
    className,
    fullWidth = false,
}) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const displayHelperText = errorMessage || helperText;

    const fieldClasses = clsx(
        'form-field',
        {
            'w-full': fullWidth,
        },
        className
    );

    const inputId = inputProps?.id || `field-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={fieldClasses}>
            {label && (
                <Label
                    htmlFor={inputId}
                    size={labelSize}
                    variant={labelVariant}
                    required={required}
                    {...labelProps}
                >
                    {label}
                </Label>
            )}

            <Input
                id={inputId}
                error={hasError}
                fullWidth={fullWidth}
                helperText={displayHelperText}
                {...inputProps}
            />
        </div>
    );
}; 